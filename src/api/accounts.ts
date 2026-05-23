import { http } from "./http";
import type {
	Account,
	AccountBalance,
	CreateAccountRequest,
	UUID,
} from "./types";

export const accountsApi = {
	async create(payload: CreateAccountRequest): Promise<Account> {
		const { data } = await http.post<Account>("/accounts", payload);

		return data;
	},

	async list(): Promise<Account[]> {
		const { data } = await http.get<Account[]>("/accounts");

		return data;
	},

	async getBalance(accountId: UUID): Promise<AccountBalance> {
		const { data } = await http.get<AccountBalance>(`/accounts/${accountId}/balance`);

		return data;
	},

	async patch(accountId: UUID, payload: Partial<Account>): Promise<Account> {
		const { data } = await http.patch<Account>(`/accounts/${accountId}`, payload);

		return data;
	},

	// TODO: not implemented in the backend
	async update(accountId: UUID, payload: Account): Promise<Account> {
		const { data } = await http.put<Account>(`/accounts/${accountId}`, payload);

		return data;
	},

	async delete(accountId: UUID): Promise<void> {
		await http.delete(`/accounts/${accountId}`);
	}
};
