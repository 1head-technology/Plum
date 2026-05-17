import { http } from "./http";
import type {
	Budget,
	BudgetSummary,
	CreateBudgetRequest,
	UUID,
} from "./types";

export const budgetsApi = {
	async create(payload: CreateBudgetRequest): Promise<Budget> {
		const { data } = await http.post<Budget>("/budgets", payload);
		return data;
	},

	async list(): Promise<Budget[]> {
		const { data } = await http.get<Budget[]>("/budgets");
		return data;
	},

	async getSummary(budgetId: UUID): Promise<BudgetSummary> {
		const { data } = await http.get<BudgetSummary>(`/budgets/${budgetId}/summary`);
		return data;
	},
};
