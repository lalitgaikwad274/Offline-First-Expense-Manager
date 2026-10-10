
const isProd = false
export const BASE_URL = isProd ? "https://expensio-backend-a96v.onrender.com" : "http://192.168.1.64:8000"


export const ENDPOINTS = {
   ADD_TRANSACTION: `/api/transactions`,
   GET_TRANSACTION: `/api/transactions`,
   LOGIN: `/auth/login`,
   ADD_BANK_ACCOUNT: `/api/bank-accounts/`,
   GET_BANK_ACCOUNT: `/api/bank-accounts`,
   DELETE_BANK_ACCOUNT: `/api/bank-accounts`,
   GET_GROUP: '/groups',
   CREATE_GROUP: '/groups',
   ADD_GROUP: '/groups',
   DELETE_GROUP: '/groups',
   UPDATE_GROUP: '/groups',
   GET_GROUP_DETAILS: (id: number | string) => `/groups/${id}`,
   ADD_GROUP_EXPENSE: (id?: number | string) => (id ? `/groups/${id}/expenses` : `/groups/expenses`),
   CREATE_GROUP_EXPENSE: '/groups/expenses',
   GET_ALL_EXPENSES: '/groups/expenses',
   DELETE_GROUP_EXPENSE: (groupId: number | string, expenseId: number | string) => `/groups/${groupId}/expenses/${expenseId}`,
   GET_GROUP_BY_ID: (id: number | string) => `/groups/${id}`,
   GET_GROUP_EXPENSES: (id: number | string) => `/groups/${id}/expenses`,
   GET_GROUP_SETTLEMENTS: (id: number | string) => `/groups/${id}/settlements`,
   GET_GROUP_BALANCES: (id: number | string) => `/groups/${id}/balances`,
   SETTLE_GROUP_EXPENSE: (groupId: number | string, expenseId: number | string) => `/groups/${groupId}/expenses/${expenseId}/settle`,
};