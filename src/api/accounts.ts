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
};
