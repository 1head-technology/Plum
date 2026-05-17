import { http } from "./http";
import type {
	ISODate,
	RecordTransactionRequest,
	RecordTransferRequest,
	Transaction,
	UUID,
} from "./types";

export interface ListTransactionsByAccountOptions {
	from?: ISODate;
	to?: ISODate;
}

export const transactionsApi = {
	async record(payload: RecordTransactionRequest): Promise<Transaction> {
		const { data } = await http.post<Transaction>("/transactions", payload);
		return data;
	},

	async recordTransfer(payload: RecordTransferRequest): Promise<Transaction[]> {
		const { data } = await http.post<Transaction[]>("/transfers", payload);
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
};
