import { http } from "./http";
import type {
	AddContributionRequest,
	CreateSavingsGoalRequest,
	SavingsGoal,
	UUID,
} from "./types";

export const savingsGoalsApi = {
	async create(payload: CreateSavingsGoalRequest): Promise<SavingsGoal> {
		const { data } = await http.post<SavingsGoal>("/savings-goals", payload);
		return data;
	},

	async list(): Promise<SavingsGoal[]> {
		const { data } = await http.get<SavingsGoal[]>("/savings-goals");
		return data;
	},

	async addContribution(
		goalId: UUID,
		payload: AddContributionRequest,
	): Promise<SavingsGoal> {
		const { data } = await http.post<SavingsGoal>(
			`/savings-goals/${goalId}/contributions`,
			payload,
		);
		return data;
	},
};
