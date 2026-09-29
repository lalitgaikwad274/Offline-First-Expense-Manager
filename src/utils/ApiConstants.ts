
const isProd = false
export const BASE_URL = isProd ? "https://expensio-backend-a96v.onrender.com" : "http://192.168.1.64:8000"


export const ENDPOINTS = {
   ADD_TRANSACTION: `/api/transactions`,
   GET_TRANSACTION: `/api/transactions`,
   LOGIN: `/auth/login`,
   ADD_BANK_ACCOUNT: `/api/bank-accounts/`,
   GET_BANK_ACCOUNT: `/api/bank-accounts`,
   DELETE_BANK_ACCOUNT: `/api/bank-accounts`,
};