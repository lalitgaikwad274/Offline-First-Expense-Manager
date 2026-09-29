import { getAuth } from "@react-native-firebase/auth";
import axios, { AxiosRequestConfig, Method } from "axios";
import { BASE_URL } from "../utils/ApiConstants";


export const serverCall = async (
   url: string,
   method: Method = "GET",
   headers: Record<string, string> = {},
   data: Record<string, any> = {}
) => {
   try {
      if (!url) {
         throw new Error("Endpoint URL is undefined or empty. Please check your ENDPOINTS configuration.");
      }

      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
         throw new Error("No authenticated user found");
      }

      // Get Firebase ID token
      const idToken = await currentUser.getIdToken();

      const requestHeaders = {
         ...headers,
         "Content-Type": "application/json",
         Authorization: `Bearer ${idToken}`,
      };

      const formattedUrl = url.startsWith('/') ? url : `/${url}`;
      const baseUrlClean = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const URL = `${baseUrlClean}${formattedUrl}`;

      const config: AxiosRequestConfig = {
         url: URL,
         method,
         headers: requestHeaders,
         data,
      };

      const response = await axios(config);
      if (response?.status == 200 || response?.status == 201 || response?.status == 202) {
         return {
            success: true,
            data: response.data
         }
      }
      return {
         success: false,
         data: []
      };
   } catch (error: any) {
      if (axios.isAxiosError(error)) {
         console.error(`API Error [${error.code || 'UNKNOWN'}]:`, {
            message: error.message,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            data: error.response?.data,
         });
      } else {
         console.error("API Error:", error);
      }
      throw error;
   }
};
