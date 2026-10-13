import { Platform } from 'react-native';
import {
  ApiLogEntry,
  ApiLogFilter,
  ApiLoggerConfig,
  ApiLoggerStats,
  ApiLogStatus,
  AuthDiagnostics,
  DiagnosticAnalysis,
  HttpMethod,
} from '../types/apiLogger';

// Default configuration
const DEFAULT_CONFIG: ApiLoggerConfig = {
  maxEntries: 200,
  enabled: true, // Active in dev or when developer mode is enabled
  maxBodyLength: 2500,
  redactedKeys: [
    'authorization',
    'auth',
    'password',
    'pass',
    'token',
    'idtoken',
    'refreshtoken',
    'access_token',
    'secret',
    'cookie',
    'set-cookie',
    'x-api-key',
    'apikey',
    'cvv',
    'pin',
    'card_number',
    'cardnumber',
    'account_number',
    'accountnumber',
  ],
};

class ApiLoggerService {
  private logs: ApiLogEntry[] = [];
  private listeners: Set<() => void> = new Set();
  private config: ApiLoggerConfig = { ...DEFAULT_CONFIG };

  /**
   * Updates configuration settings
   */
  public setConfig(newConfig: Partial<ApiLoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Returns current configuration
   */
  public getConfig(): ApiLoggerConfig {
    return { ...this.config };
  }

  /**
   * Subscribe to log updates. Returns an unsubscribe function.
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all active listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.warn('[ApiLogger] Error in subscriber callback:', err);
      }
    });
  }

  /**
   * Generate a unique request identifier
   */
  public generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  /**
   * Format a date into a clean 12-hour timestamp string
   */
  private formatTimestamp(timestamp: number): string {
    const d = new Date(timestamp);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
    return `${formattedHours}:${minutes}:${seconds} ${ampm}`;
  }

  /**
   * Parses query parameters from a URL string
   */
  public parseQueryParams(url: string): Record<string, string> {
    const params: Record<string, string> = {};
    const queryIndex = url.indexOf('?');
    if (queryIndex === -1) return params;

    const queryString = url.slice(queryIndex + 1);
    const pairs = queryString.split('&');
    for (const pair of pairs) {
      if (!pair) continue;
      const [key, value] = pair.split('=');
      if (key) {
        try {
          params[decodeURIComponent(key)] = value ? decodeURIComponent(value) : '';
        } catch {
          params[key] = value || '';
        }
      }
    }
    return params;
  }

  /**
   * Sanitize headers to ensure tokens and secrets are redacted
   */
  public sanitizeHeaders(headers?: Record<string, any>): Record<string, string> {
    if (!headers) return {};
    const sanitized: Record<string, string> = {};

    for (const [key, rawValue] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      const value = String(rawValue ?? '');

      if (lowerKey === 'authorization') {
        if (value.startsWith('Bearer ') && value.length > 7) {
          sanitized[key] = 'Bearer [ATTACHED & REDACTED]';
        } else if (value.trim().length > 0) {
          sanitized[key] = '[REDACTED_AUTH_TOKEN]';
        } else {
          sanitized[key] = '[NONE]';
        }
      } else if (
        this.config.redactedKeys.some(redactedKey => lowerKey.includes(redactedKey))
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitize payloads (request/response) to redact passwords, tokens, bank accounts, and truncate long content
   */
  public sanitizePayload(payload: any, maxLen = this.config.maxBodyLength): any {
    if (payload === null || payload === undefined) {
      return null;
    }

    // Handle primitives
    if (typeof payload !== 'object') {
      const strVal = String(payload);
      if (strVal.length > maxLen) {
        return `${strVal.substring(0, maxLen)}... [TRUNCATED: ${strVal.length} chars total]`;
      }
      return payload;
    }

    // Recursively sanitize objects and arrays while guarding against circular references
    const seen = new WeakSet();

    const cleanObject = (obj: any, depth = 0): any => {
      if (depth > 6) return '[MAX_DEPTH_REACHED]';
      if (obj === null || obj === undefined) return obj;

      if (typeof obj !== 'object') {
        if (typeof obj === 'string') {
          // Check for sensitive patterns like account numbers (10 to 18 consecutive digits)
          if (/^\d{10,18}$/.test(obj)) {
            return `****${obj.slice(-4)}`;
          }
          if (obj.length > 500) {
            return `${obj.substring(0, 500)}... [TRUNCATED]`;
          }
        }
        return obj;
      }

      if (seen.has(obj)) {
        return '[CIRCULAR_REFERENCE]';
      }
      seen.add(obj);

      if (Array.isArray(obj)) {
        const MAX_ARRAY_ITEMS = 20;
        const mapped = obj.slice(0, MAX_ARRAY_ITEMS).map(item => cleanObject(item, depth + 1));
        if (obj.length > MAX_ARRAY_ITEMS) {
          mapped.push(`[... ${obj.length - MAX_ARRAY_ITEMS} more items hidden]` as any);
        }
        return mapped;
      }

      const result: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase();
        if (this.config.redactedKeys.some(rKey => lowerKey.includes(rKey))) {
          result[key] = '[REDACTED]';
        } else if (lowerKey.includes('account_no') || lowerKey.includes('accountnumber')) {
          const valStr = String(val || '');
          result[key] = valStr.length > 4 ? `****${valStr.slice(-4)}` : '[REDACTED]';
        } else {
          result[key] = cleanObject(val, depth + 1);
        }
      }

      return result;
    };

    try {
      return cleanObject(payload);
    } catch {
      return '[PAYLOAD_SERIALIZATION_FAILED]';
    }
  }

  /**
   * Diagnoses known mobile/backend anomalies (FastAPI, Firebase, Render, Network)
   */
  public analyzeIssue(
    status: ApiLogStatus,
    statusCode: number | null | undefined,
    url: string,
    durationMs: number | null | undefined,
    errorCode: string | null | undefined,
    errorMessage: string | null | undefined,
    responseData: any,
    authDiagnostics: AuthDiagnostics
  ): DiagnosticAnalysis {
    // 1. Success 200 with Empty Array
    if (status === 'success' && (statusCode === 200 || statusCode === 201)) {
      const isArrayEmpty =
        Array.isArray(responseData) && responseData.length === 0;
      const isDataArrayEmpty =
        responseData &&
        Array.isArray(responseData.data) &&
        responseData.data.length === 0;

      if (isArrayEmpty || isDataArrayEmpty) {
        return {
          category: 'EMPTY_DATA',
          title: 'Empty Response (0 Records)',
          summary:
            'The API call succeeded, but the database returned an empty list. If another device displays items for this account, the devices may be hitting different backend databases or filtering by different User IDs.',
          severity: 'info',
          suggestions: [
            `Verify Firebase UID matches across devices (Current UID: ${authDiagnostics.firebaseUid || 'Unknown'}).`,
            'Confirm both devices are pointing to the identical Render backend URL.',
            'Check if user profile mapping was created via /auth/login on this device.',
          ],
        };
      }

      return {
        category: 'OK',
        title: 'Request Succeeded',
        summary: `API responded with HTTP ${statusCode} in ${durationMs ?? 0}ms.`,
        severity: 'info',
        suggestions: ['No action required.'],
      };
    }

    // 2. 401 Unauthorized
    if (statusCode === 401) {
      return {
        category: 'AUTH_EXPIRED',
        title: '401 Unauthorized (Firebase ID Token)',
        summary:
          'FastAPI rejected the request because the Firebase ID token was missing, expired, or failed verification.',
        severity: 'error',
        suggestions: [
          authDiagnostics.tokenAttached
            ? 'Firebase ID token was attached. It may have expired or device clock has skewed.'
            : 'No Firebase ID token was attached in the Authorization header.',
          'Check device system date & time setting (ensure "Set time automatically" is enabled).',
          'Verify that the Render backend has configured the correct Firebase service account credentials.',
          'Log out and log back in to force a fresh Firebase token issuance.',
        ],
      };
    }

    // 3. 403 Forbidden
    if (statusCode === 403) {
      return {
        category: 'PERMISSION_DENIED',
        title: '403 Forbidden (Access Denied)',
        summary:
          'The user is authenticated, but does not have permission to access this resource or tenant record.',
        severity: 'error',
        suggestions: [
          'Verify if the authenticated user is the owner or member of this resource.',
          'Check PostgreSQL role or row-level permissions on the backend.',
        ],
      };
    }

    // 4. 404 Not Found
    if (statusCode === 404) {
      return {
        category: 'NOT_FOUND',
        title: '404 Not Found (Missing Route or Record)',
        summary: `The endpoint "${url}" was not found, or the requested resource/user does not exist in the database.`,
        severity: 'error',
        suggestions: [
          'Check ENDPOINTS configuration in ApiConstants.ts for path typos.',
          'If loading transactions for a newly logged-in user, confirm /auth/login created the user record in PostgreSQL first.',
        ],
      };
    }

    // 5. 422 Unprocessable Entity (FastAPI Schema Validation)
    if (statusCode === 422) {
      return {
        category: 'VALIDATION_ERROR',
        title: '422 Validation Error (FastAPI Pydantic)',
        summary:
          'FastAPI rejected the request body or query parameters because schema validation failed.',
        severity: 'error',
        suggestions: [
          'Inspect the response body "detail" field for exact validation errors.',
          'Check that dates match ISO format and numeric fields are not passed as empty strings.',
        ],
      };
    }

    // 6. 500 Internal Server Error
    if (statusCode && statusCode >= 500) {
      return {
        category: 'SERVER_ERROR',
        title: `HTTP ${statusCode} Backend Server Error`,
        summary:
          'FastAPI backend or PostgreSQL database raised an unhandled exception.',
        severity: 'error',
        suggestions: [
          'Check Render Dashboard logs for the backend traceback.',
          'Verify PostgreSQL connection pool limits on Render.',
          'Verify if database migrations are up to date.',
        ],
      };
    }

    // 7. Network / Connectivity / Timeout Failures
    if (status === 'network_error') {
      // Local IP Check
      if (url.includes('192.168.') || url.includes('localhost') || url.includes('127.0.0.1')) {
        return {
          category: 'PRIVATE_IP_ERROR',
          title: 'Unreachable Local IP Address',
          summary:
            'The app is attempting to connect to a local development IP (e.g. 192.168.122.1:8000). Physical devices cannot reach this unless on the same local Wi-Fi with firewall ports opened.',
          severity: 'error',
          suggestions: [
            'Check ApiConstants.ts: Ensure isProd is set to true for real devices.',
            'Switch BASE_URL to https://expensio-backend-a96v.onrender.com.',
            'Ensure cleartext HTTP traffic is not blocked by Android Network Security config.',
          ],
        };
      }

      // Render Cold-Start Timeout
      if (
        (durationMs && durationMs > 9000) ||
        errorCode === 'ECONNABORTED' ||
        (errorMessage && errorMessage.toLowerCase().includes('timeout'))
      ) {
        return {
          category: 'RENDER_TIMEOUT',
          title: 'Render Cold-Start Timeout',
          summary:
            'Render free instances sleep after 15 minutes of inactivity and take 50+ seconds to spin up on the first request. The client timed out waiting for a response.',
          severity: 'warning',
          suggestions: [
            'Wait 60 seconds and tap Retry to allow the Render server time to wake up.',
            'Increase Axios timeout configuration for initial requests.',
            'Check Render service status in your Render dashboard.',
          ],
        };
      }

      // Offline / DNS failure
      return {
        category: 'NETWORK_OFFLINE',
        title: 'Network / DNS Resolution Failure',
        summary: `Network connection failed: ${errorMessage || errorCode || 'Unable to connect to host'}.`,
        severity: 'error',
        suggestions: [
          'Verify device has active Internet access (cellular data or Wi-Fi).',
          'Check if device has private DNS or ad-blocker VPN preventing Render domain resolution.',
          'Test if https://expensio-backend-a96v.onrender.com is reachable in mobile Chrome.',
        ],
      };
    }

    return {
      category: 'UNKNOWN',
      title: 'Unknown Request Status',
      summary: errorMessage || 'An unexpected error occurred.',
      severity: 'error',
      suggestions: ['Inspect full request and response details below.'],
    };
  }

  /**
   * Creates a new pending log entry when an API request begins
   */
  public createPendingLog(params: {
    requestId?: string;
    method: HttpMethod;
    url: string;
    baseUrl: string;
    endpoint: string;
    requestHeaders?: Record<string, any>;
    requestData?: any;
    authDiagnostics: AuthDiagnostics;
  }): string {
    if (!this.config.enabled) return '';

    const id = params.requestId || this.generateRequestId();
    const timestamp = Date.now();
    const queryParams = this.parseQueryParams(params.url);

    const entry: ApiLogEntry = {
      id,
      method: (params.method || 'GET').toUpperCase(),
      url: params.url,
      baseUrl: params.baseUrl,
      endpoint: params.endpoint,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      timestamp,
      formattedTime: this.formatTimestamp(timestamp),
      durationMs: null,
      status: 'pending',
      statusCode: null,
      statusText: 'Pending...',
      requestHeaders: this.sanitizeHeaders(params.requestHeaders),
      requestData: this.sanitizePayload(params.requestData),
      responseHeaders: undefined,
      responseData: undefined,
      errorMessage: null,
      errorCode: null,
      authDiagnostics: params.authDiagnostics,
      analysis: null,
    };

    // Add to top of list
    this.logs.unshift(entry);

    // Limit memory footprint
    if (this.logs.length > this.config.maxEntries) {
      this.logs.pop();
    }

    this.notifyListeners();
    return id;
  }

  /**
   * Updates a log entry upon successful response
   */
  public completeSuccessLog(
    id: string,
    params: {
      statusCode: number;
      durationMs: number;
      responseHeaders?: Record<string, any>;
      responseData?: any;
    }
  ) {
    if (!this.config.enabled) return;

    const entry = this.logs.find(item => item.id === id);
    if (!entry) return;

    entry.status = 'success';
    entry.statusCode = params.statusCode;
    entry.statusText = `${params.statusCode} OK`;
    entry.durationMs = params.durationMs;
    entry.responseHeaders = this.sanitizeHeaders(params.responseHeaders);
    entry.responseData = this.sanitizePayload(params.responseData);

    entry.analysis = this.analyzeIssue(
      entry.status,
      entry.statusCode,
      entry.url,
      entry.durationMs,
      null,
      null,
      entry.responseData,
      entry.authDiagnostics
    );

    this.notifyListeners();
  }

  /**
   * Updates a log entry upon HTTP Error (4xx, 5xx)
   */
  public completeHttpErrorLog(
    id: string,
    params: {
      statusCode: number;
      durationMs: number;
      errorMessage: string;
      errorCode?: string;
      responseHeaders?: Record<string, any>;
      responseData?: any;
    }
  ) {
    if (!this.config.enabled) return;

    const entry = this.logs.find(item => item.id === id);
    if (!entry) return;

    entry.status = 'http_error';
    entry.statusCode = params.statusCode;
    entry.statusText = `HTTP ${params.statusCode}`;
    entry.durationMs = params.durationMs;
    entry.errorMessage = params.errorMessage;
    entry.errorCode = params.errorCode || `HTTP_${params.statusCode}`;
    entry.responseHeaders = this.sanitizeHeaders(params.responseHeaders);
    entry.responseData = this.sanitizePayload(params.responseData);

    entry.analysis = this.analyzeIssue(
      entry.status,
      entry.statusCode,
      entry.url,
      entry.durationMs,
      entry.errorCode,
      entry.errorMessage,
      entry.responseData,
      entry.authDiagnostics
    );

    this.notifyListeners();
  }

  /**
   * Updates a log entry upon Network Error (timeout, DNS, offline, connection refused)
   */
  public completeNetworkErrorLog(
    id: string,
    params: {
      durationMs: number;
      errorMessage: string;
      errorCode?: string;
    }
  ) {
    if (!this.config.enabled) return;

    const entry = this.logs.find(item => item.id === id);
    if (!entry) return;

    entry.status = 'network_error';
    entry.statusCode = null;
    entry.statusText = params.errorCode || 'Network Error';
    entry.durationMs = params.durationMs;
    entry.errorMessage = params.errorMessage;
    entry.errorCode = params.errorCode || 'ERR_NETWORK';

    entry.analysis = this.analyzeIssue(
      entry.status,
      entry.statusCode,
      entry.url,
      entry.durationMs,
      entry.errorCode,
      entry.errorMessage,
      null,
      entry.authDiagnostics
    );

    this.notifyListeners();
  }

  /**
   * Clears all recorded logs from memory
   */
  public clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }

  /**
   * Returns a copy of all recorded logs
   */
  public getLogs(): ApiLogEntry[] {
    return [...this.logs];
  }

  /**
   * Returns a specific log by ID
   */
  public getLogById(id: string): ApiLogEntry | undefined {
    return this.logs.find(item => item.id === id);
  }

  /**
   * Returns summary counts
   */
  public getStats(): ApiLoggerStats {
    let success = 0;
    let httpError = 0;
    let networkError = 0;
    let pending = 0;

    for (const log of this.logs) {
      if (log.status === 'success') success++;
      else if (log.status === 'http_error') httpError++;
      else if (log.status === 'network_error') networkError++;
      else if (log.status === 'pending') pending++;
    }

    return {
      total: this.logs.length,
      success,
      httpError,
      networkError,
      pending,
    };
  }

  /**
   * Generates a curl command representation for a log entry
   */
  public exportLogAsCurl(log: ApiLogEntry): string {
    let curl = `curl -X ${log.method} "${log.url}" \\\n`;
    curl += `  -H "Content-Type: application/json" \\\n`;
    if (log.authDiagnostics.tokenAttached) {
      curl += `  -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \\\n`;
    }
    if (log.requestData && (log.method === 'POST' || log.method === 'PUT' || log.method === 'PATCH')) {
      const bodyStr = JSON.stringify(log.requestData, null, 2);
      curl += `  -d '${bodyStr}'`;
    }
    return curl.trim();
  }

  /**
   * Formats a single log entry as diagnostic text
   */
  public exportLogAsText(log: ApiLogEntry): string {
    const lines = [
      `========================================`,
      `EXPENSIO API DIAGNOSTIC REPORT`,
      `Request ID: ${log.id}`,
      `Timestamp: ${new Date(log.timestamp).toISOString()} (${log.formattedTime})`,
      `Platform: ${Platform.OS} (v${Platform.Version})`,
      `Method: ${log.method}`,
      `URL: ${log.url}`,
      `Base URL: ${log.baseUrl}`,
      `Endpoint: ${log.endpoint}`,
      `Status: ${log.status.toUpperCase()} (${log.statusCode ?? 'N/A'})`,
      `Duration: ${log.durationMs !== null ? `${log.durationMs}ms` : 'Pending'}`,
      `----------------------------------------`,
      `AUTH DIAGNOSTICS:`,
      `- Authenticated: ${log.authDiagnostics.isAuthenticated ? 'YES' : 'NO'}`,
      `- Firebase UID: ${log.authDiagnostics.firebaseUid || 'None'}`,
      `- Token Attached: ${log.authDiagnostics.tokenAttached ? 'YES' : 'NO'}`,
      `- Token Error: ${log.authDiagnostics.tokenError || 'None'}`,
      `----------------------------------------`,
    ];

    if (log.queryParams) {
      lines.push(`QUERY PARAMETERS:`, JSON.stringify(log.queryParams, null, 2), `----------------------------------------`);
    }

    if (log.requestHeaders) {
      lines.push(`REQUEST HEADERS:`, JSON.stringify(log.requestHeaders, null, 2), `----------------------------------------`);
    }

    if (log.requestData) {
      lines.push(`REQUEST BODY:`, JSON.stringify(log.requestData, null, 2), `----------------------------------------`);
    }

    if (log.errorMessage) {
      lines.push(`ERROR MESSAGE:`, `${log.errorCode ? `[${log.errorCode}] ` : ''}${log.errorMessage}`, `----------------------------------------`);
    }

    if (log.analysis) {
      lines.push(
        `DIAGNOSTIC ANALYSIS:`,
        `Title: ${log.analysis.title}`,
        `Summary: ${log.analysis.summary}`,
        `Suggestions:`,
        ...log.analysis.suggestions.map(s => `  * ${s}`),
        `----------------------------------------`
      );
    }

    if (log.responseData) {
      lines.push(`RESPONSE BODY:`, JSON.stringify(log.responseData, null, 2));
    }

    lines.push(`========================================`);
    return lines.join('\n');
  }

  /**
   * Formats all logs into a comprehensive diagnostic summary report
   */
  public exportAllLogs(): string {
    const stats = this.getStats();
    const header = [
      `======================================================`,
      `EXPENSIO API DEBUGGER - FULL DIAGNOSTIC DUMP`,
      `Generated: ${new Date().toISOString()}`,
      `Total Requests: ${stats.total}`,
      `Success: ${stats.success} | HTTP Errors: ${stats.httpError} | Network Errors: ${stats.networkError} | Pending: ${stats.pending}`,
      `Platform: ${Platform.OS} (v${Platform.Version})`,
      `======================================================\n`,
    ].join('\n');

    const body = this.logs.map(log => this.exportLogAsText(log)).join('\n\n');
    return `${header}\n${body}`;
  }
}

// Singleton export
export const apiLogger = new ApiLoggerService();
