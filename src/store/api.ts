import { serverCall } from "../services/api";
import { ENDPOINTS } from "../utils/ApiConstants";
import { setExpenses } from "./expenseSlice";
import { formatTransaction } from "../utils/helpers";
import { Expense } from "../types/expense";

export const getTransactions = () => {
    return async (dispatch: any) => {
        try {
            const result = await serverCall(ENDPOINTS.GET_TRANSACTION, "GET");
            console.log("Raw transactions API response:", result);

            // Handle responses whether returned directly as an array or wrapped in data/transactions
            let rawList: any[] = [];
            if (Array.isArray(result)) {
                rawList = result;
            } else if (Array.isArray(result?.data)) {
                rawList = result.data;
            } else if (Array.isArray(result?.transactions)) {
                rawList = result.transactions;
            } else if (Array.isArray(result?.result)) {
                rawList = result.result;
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
        }
    };
};