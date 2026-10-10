import { serverCall } from "../services/api";
import { ENDPOINTS } from "../utils/ApiConstants";
import { setBankAccounts, setExpenses, setIncome, setIsLoading } from "./expenseSlice";
import { formatTransaction, formatGroupExpense } from "../utils/helpers";
import { Expense } from "../types/expense";
import {
  setGroups,
  createGroup as addGroupToState,
  updateGroup,
  deleteGroup as removeGroupFromState,
  addGroupExpense,
  setGroupExpenses,
  deleteGroupExpense,
  setLoading as setGroupLoading,
} from "./groupExpenseSlice";
import { CreateGroupExpensePayload } from "../types/groupExpense";

export const getTransactions = () => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            const result = await serverCall(ENDPOINTS.GET_TRANSACTION, "GET");
            console.log("Raw transactions API response:", result);

            // Handle responses whether returned directly as an array or wrapped in data/transactions
            let rawList: any[] = [];
            if (Array.isArray(result?.data)) {
                rawList = result.data;
            }

            // Format each item into { id, category, amount, date, color, synced }
            const formattedExpenses: Expense[] = rawList.map((item: any, index: number) =>
                formatTransaction(item, String(index + 1))
            );

            console.log("Formatted transactions for Redux:", formattedExpenses);
            dispatch(setExpenses(formattedExpenses));
            return formattedExpenses;
        } catch (error) {
            console.error("Error in getTransactions:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };
};

export const getBankDetails = () => {
    return async (dispatch: any) => {
        try {
            const result = await serverCall(ENDPOINTS.GET_BANK_ACCOUNT, "GET");
            console.log("#####Raw bank details API response:", result);
            if (result?.success && Array.isArray(result?.data) && result.data.length > 0) {
                const totalIncome = result.data.reduce(
                    (acc: number, curr: any) => acc + (Number(curr?.current_balance ?? curr?.balance) || 0),
                    0
                );
                dispatch(setBankAccounts(result?.data))
                dispatch(setIncome(totalIncome));
            } else {
                dispatch(setIncome(0));
            }
            
        } catch (error) {
            console.error("Error in getBankDetails:", error);
            throw error;
        }
    };
}

export const getAllGroups = () => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            dispatch(setGroupLoading(true));
            console.log("######## 65")
            const result = await serverCall(ENDPOINTS.GET_GROUP, "GET");
            console.log("Raw groups API response:", result);
            const raw = result?.data;
            const groupsList = Array.isArray(raw)
                ? raw
                : (Array.isArray(raw?.groups) ? raw.groups : (Array.isArray(raw?.data) ? raw.data : []));
            dispatch(setGroups(groupsList));
            return groupsList;
        } catch (error) {
            console.error("Error in getGroups:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
            dispatch(setGroupLoading(false));
        }
    };
}

export const createGroup = (group: any) =>{
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            const result = await serverCall(ENDPOINTS.CREATE_GROUP, "POST", {}, group);
            console.log("Raw group creation response:", result);
            const created = result?.data;
            if (created) {
                if (Array.isArray(created)) {
                    dispatch(setGroups(created));
                } else if (created.id) {
                    dispatch(addGroupToState(created));
                }
            }
            return created;
        } catch (error) {
            console.error("Error in createGroup:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };
}

export const deleteGroup = (groupId: string) => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            const result = await serverCall(ENDPOINTS.DELETE_GROUP + `/${groupId}`, "DELETE");
            console.log("Raw group deletion response:", result);
            dispatch(removeGroupFromState(groupId));
            return result?.data;
        } catch (error) {
            console.error("Error in deleteGroup:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };
};

export const addGroupExpenseApi = (expenseData: CreateGroupExpensePayload) => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            // Supports /groups/{group_id}/expenses, falling back to /groups/expenses if needed
            const endpoint = ENDPOINTS.ADD_GROUP_EXPENSE(expenseData.group_id);
            const result = await serverCall(endpoint, "POST", {}, expenseData);
            console.log("Raw group expense creation response:", result);
            const rawExpense = result?.data ?? result;
            if (rawExpense) {
                const formatted = formatGroupExpense(rawExpense);
                dispatch(addGroupExpense(formatted));
            }
            return result;
        } catch (error) {
            console.error("Error in addGroupExpenseApi:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };
};

export const getAllExpenses = () => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            dispatch(setGroupLoading(true));
            const result = await serverCall(ENDPOINTS.GET_ALL_EXPENSES, "GET");
            console.log("Raw all expenses API response:", result);
            const raw = result?.data;
            const rawList = Array.isArray(raw)
                ? raw
                : (Array.isArray(raw?.expenses) ? raw.expenses : (Array.isArray(raw?.data) ? raw.data : []));
            const formattedExpenses = rawList.map(formatGroupExpense);
            console.log("Formatted group expenses for Redux:", formattedExpenses);
            dispatch(setGroupExpenses(formattedExpenses));
            return formattedExpenses;
        } catch (error) {
            console.error("Error in getAllExpenses:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
            dispatch(setGroupLoading(false));
        }
    };
}

export const getGroupByIdApi = (groupId: string) => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));
            const result = await serverCall(ENDPOINTS.GET_GROUP_BY_ID(groupId), "GET");
            console.log("Raw group by ID API response:", result);
            const groupData = result?.data;
            if (groupData) {
                dispatch(updateGroup(groupData));
                if (Array.isArray(groupData.expenses) && groupData.expenses.length > 0) {
                    const formattedExpenses = groupData.expenses.map(formatGroupExpense);
                    dispatch(setGroupExpenses(formattedExpenses));
                }
            }
            return groupData;
        } catch (error) {
            console.error("Error in getGroupByIdApi:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };
}

export const deleteGroupExpenseApi = (groupId: string, expenseId: string) => {
    return async (dispatch: any) => {
        try {
            dispatch(setIsLoading(true));   
            const result = await serverCall(ENDPOINTS.DELETE_GROUP_EXPENSE(groupId, expenseId), "DELETE");
            console.log("Raw group expense deletion response:", result);
            dispatch(deleteGroupExpense(expenseId));
            return result;
        } catch (error) {
            console.error("Error in deleteGroupExpenseApi:", error);
            throw error;
        } finally {
            dispatch(setIsLoading(false));
        }
    };
}