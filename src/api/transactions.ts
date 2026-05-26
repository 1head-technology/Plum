import { http } from "./http";
import type {
	ISODate,
	RecordTransactionRequest,
	RecordTransferRequest,
	Transaction,
	UUID,
} from "./types";
import { useAccountsStore } from "@/stores/accounts.ts";
import { useTransactionsStore } from "@/stores/transactions.ts";

export interface ListTransactionsByAccountOptions {
	from?: ISODate;
	to?: ISODate;
}

export const transactionsApi = {
	async record(payload: RecordTransactionRequest): Promise<Transaction> {
		const { data } = await http.post<Transaction>("/transactions", payload);

		// Refresh account balance
		const accountStore = useAccountsStore();
		await accountStore.refreshBalance(payload.accountId);

		return data;
	},

	async recordTransfer(payload: RecordTransferRequest): Promise<Transaction[]> {
		const { data } = await http.post<Transaction[]>("/transfers", payload);

		// Refresh account balances
		const accountStore = useAccountsStore();
		await accountStore.refreshBalance(payload.sourceAccountId);
		await accountStore.refreshBalance(payload.destinationAccountId);

		return data;
	},

	async listByAccount(
		accountId: UUID,
		options: ListTransactionsByAccountOptions = {},
	): Promise<Transaction[]> {
		const { data } = await http.get<Transaction[]>(`/accounts/${accountId}/transactions`, {
			params: { from: options.from, to: options.to },
		});
		return data;
	},

	async list(): Promise<Transaction[]> {
		const { data } = await http.get<Transaction[]>("/transactions");
		return data;
	},

	async patch(transactionId: UUID, payload: Partial<Transaction>): Promise<Transaction> {
		const { data } = await http.patch<Transaction>(`/transactions/${transactionId}`, payload);
		return data;
	},

	async delete(transactionId: UUID): Promise<void> {
		await http.delete(`/transactions/${transactionId}`);

		const transactionStore = useTransactionsStore();
		const accountStore = useAccountsStore();

		const transaction: Transaction | undefined = transactionStore.transactions.find(t => t.id === transactionId);

		// refresh account balance
		if (transaction) {
			await accountStore.refreshBalance(transaction.accountId);
		}
	},
};
