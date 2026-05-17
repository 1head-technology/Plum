import { defineStore } from "pinia";
import { ref } from "vue";
import {
	savingsGoalsApi,
	type AddContributionRequest,
	type CreateSavingsGoalRequest,
	type SavingsGoal,
	type UUID,
} from "@/api";

export const useSavingsGoalsStore = defineStore("savingsGoals", () => {
	const goals = ref<SavingsGoal[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function load(): Promise<void> {
		loading.value = true;
		error.value = null;
		try {
			goals.value = await savingsGoalsApi.list();
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to load savings goals";
		} finally {
			loading.value = false;
		}
	}

	async function create(payload: CreateSavingsGoalRequest): Promise<SavingsGoal> {
		const created = await savingsGoalsApi.create(payload);
		goals.value = [...goals.value, created];
		return created;
	}

	async function contribute(goalId: UUID, payload: AddContributionRequest): Promise<SavingsGoal> {
		const updated = await savingsGoalsApi.addContribution(goalId, payload);
		goals.value = goals.value.map((g) => (g.id === goalId ? updated : g));
		return updated;
	}

	function reset(): void {
		goals.value = [];
		error.value = null;
	}

	return { goals, loading, error, load, create, contribute, reset };
});
