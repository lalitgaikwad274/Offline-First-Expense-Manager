import { getAuth } from "@react-native-firebase/auth";
import axios, { AxiosRequestConfig, Method } from "axios";
import { BASE_URL } from "../utils/ApiConstants";
import { apiLogger } from "./apiLogger";

export const serverCall = async (
   url: string,
   method: Method = "GET",
   headers: Record<string, string> = {},
   data: Record<string, any> = {}
) => {
   const startTime = Date.now();
   let requestId = '';
   let formattedUrl = '';
   let fullUrl = '';
   let baseUrlClean = '';

   try {
      if (!url) {
         throw new Error("Endpoint URL is undefined or empty. Please check your ENDPOINTS configuration.");
      }

      formattedUrl = url.startsWith('/') ? url : `/${url}`;
      baseUrlClean = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      fullUrl = `${baseUrlClean}${formattedUrl}`;

      const auth = getAuth();
      const currentUser = auth.currentUser;

      const authDiagnostics = {
         isAuthenticated: !!currentUser,
         firebaseUid: currentUser?.uid || null,
         userEmail: currentUser?.email || null,
         tokenAttached: false,
         tokenError: null as string | null,
      };

      if (!currentUser) {
         authDiagnostics.tokenError = "No authenticated user found in Firebase Auth";
         requestId = apiLogger.createPendingLog({
            method,
            url: fullUrl,
            baseUrl: baseUrlClean,
            endpoint: formattedUrl,
            requestHeaders: headers,
            requestData: data,
            authDiagnostics,
         });
         apiLogger.completeHttpErrorLog(requestId, {
            statusCode: 401,
            durationMs: Date.now() - startTime,
            errorMessage: "No authenticated user found. Please sign in to continue.",
            errorCode: "AUTH_NO_USER",
            responseData: { error: "No authenticated user found" },
         });
         throw new Error("No authenticated user found");
      }

      // Safely obtain Firebase ID token without logging token string to console
      let idToken = '';
      try {
         idToken = await currentUser.getIdToken();
         authDiagnostics.tokenAttached = !!idToken;
      } catch (tokenErr: any) {
         authDiagnostics.tokenError = tokenErr?.message || "Failed to retrieve Firebase ID token";
         requestId = apiLogger.createPendingLog({
            method,
            url: fullUrl,
            baseUrl: baseUrlClean,
            endpoint: formattedUrl,
            requestHeaders: headers,
            requestData: data,
            authDiagnostics,
         });
         apiLogger.completeNetworkErrorLog(requestId, {
            durationMs: Date.now() - startTime,
            errorMessage: `Firebase Token Error: ${tokenErr?.message || 'Token retrieval failed'}`,
            errorCode: "FIREBASE_TOKEN_ERROR",
         });
         throw tokenErr;
      }
      console.log("###### idToken", idToken)
      const contentType = headers['Content-Type'] || headers['content-type'] || "application/json";
      const requestHeaders: Record<string, string> = {
         "Content-Type": contentType,
         ...headers,
         Authorization: `Bearer ${idToken}`,
      };

      // Create pending log in centralized API debugger
      requestId = apiLogger.createPendingLog({
         method,
         url: fullUrl,
         baseUrl: baseUrlClean,
         endpoint: formattedUrl,
         requestHeaders,
         requestData: data,
         authDiagnostics,
      });

      const config: AxiosRequestConfig = {
         url: fullUrl,
         method,
         headers: requestHeaders,
         timeout: 60000, // 60s timeout to allow Render free-tier cold starts to complete
      };

      if (method.toUpperCase() === "GET" && data && Object.keys(data).length > 0) {
         config.params = data;
      } else if (data && Object.keys(data).length > 0) {
         config.data = data;
      }

      const response = await axios(config);
      const durationMs = Date.now() - startTime;

      if (response?.status === 200 || response?.status === 201 || response?.status === 202) {
         apiLogger.completeSuccessLog(requestId, {
            statusCode: response.status,
            durationMs,
            responseHeaders: (response.headers as Record<string, any>) || {},
            responseData: response.data,
         });

         return {
            success: true,
            data: response.data,
         };
      }

      // Unexpected status code that didn't trigger axios exception
      apiLogger.completeHttpErrorLog(requestId, {
         statusCode: response?.status || 200,
         durationMs,
         errorMessage: `Unexpected HTTP status: ${response?.status}`,
         responseHeaders: (response?.headers as Record<string, any>) || {},
         responseData: response?.data,
      });

      return {
         success: false,
         data: [],
      };
   } catch (error: any) {
      const durationMs = Date.now() - startTime;

      if (axios.isAxiosError(error)) {
         if (error.response) {
            // HTTP response error (4xx, 5xx)
            if (requestId) {
               apiLogger.completeHttpErrorLog(requestId, {
                  statusCode: error.response.status,
                  durationMs,
                  errorMessage: error.message,
                  errorCode: error.code || `HTTP_${error.response.status}`,
                  responseHeaders: (error.response.headers as Record<string, any>) || {},
                  responseData: error.response.data,
               });
            }
            console.error(`#### API HTTP Error [${error.response.status}]:`, {
               message: error.message,
               url: error.config?.url,
               method: error.config?.method?.toUpperCase(),
               status: error.response?.status,
               data: error.response?.data,
            });
         } else {
            // Network failure (timeout, DNS, offline, connection refused)
            if (requestId) {
               apiLogger.completeNetworkErrorLog(requestId, {
                  durationMs,
                  errorMessage: error.message,
                  errorCode: error.code || 'ERR_NETWORK',
               });
            }
            console.error(`#### API Network Error [${error.code || 'UNKNOWN'}]:`, {
               message: error.message,
               url: error.config?.url,
               method: error.config?.method?.toUpperCase(),
            });
         }
      } else {
         if (requestId) {
            apiLogger.completeNetworkErrorLog(requestId, {
               durationMs,
               errorMessage: error?.message || 'Unknown API Exception',
               errorCode: 'APP_EXCEPTION',
            });
         }
         console.error("#### API Error:", error);
      }
      throw error;
   }
};

