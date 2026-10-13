export type ApiLogStatus = 'pending' | 'success' | 'http_error' | 'network_error';

export type ApiLogFilter = 'all' | 'success' | 'http_error' | 'network_error' | 'pending';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | string;

export interface AuthDiagnostics {
  isAuthenticated: boolean;
  firebaseUid?: string | null;
  tokenAttached: boolean;
  tokenError?: string | null;
  userEmail?: string | null;
}

export type DiagnosticCategory =
  | 'OK'
  | 'AUTH_EXPIRED'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'RENDER_TIMEOUT'
  | 'NETWORK_OFFLINE'
  | 'PRIVATE_IP_ERROR'
  | 'EMPTY_DATA'
  | 'UNKNOWN';

export interface DiagnosticAnalysis {
  category: DiagnosticCategory;
  title: string;
  summary: string;
  severity: 'info' | 'warning' | 'error';
  suggestions: string[];
}

export interface ApiLogEntry {
  id: string;
  method: HttpMethod;
  url: string;
  baseUrl: string;
  endpoint: string;
  queryParams?: Record<string, any>;
  timestamp: number;
  formattedTime: string;
  durationMs?: number | null;
  status: ApiLogStatus;
  statusCode?: number | null;
  statusText?: string | null;
  requestHeaders: Record<string, string>;
  requestData?: any;
  responseHeaders?: Record<string, string>;
  responseData?: any;
  errorMessage?: string | null;
  errorCode?: string | null;
  authDiagnostics: AuthDiagnostics;
  analysis?: DiagnosticAnalysis | null;
  isTruncated?: boolean;
}

export interface ApiLoggerConfig {
  maxEntries: number;
  enabled: boolean;
  maxBodyLength: number;
  redactedKeys: string[];
}

export interface ApiLoggerStats {
  total: number;
  success: number;
  httpError: number;
  networkError: number;
  pending: number;
}
