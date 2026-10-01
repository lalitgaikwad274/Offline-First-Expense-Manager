import { serverCall } from "../services/api";
import { ENDPOINTS } from "../utils/ApiConstants";
import { setBankAccounts, setExpenses, setIncome, setIsLoading } from "./expenseSlice";
import { formatTransaction } from "../utils/helpers";
import { Expense } from "../types/expense";

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
            console.log("Raw bank details API response:", result);
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