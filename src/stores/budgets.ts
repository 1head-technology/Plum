import { defineStore } from "pinia";
import { ref } from "vue";
import {
	budgetsApi,
	type Budget,
	type BudgetSummary,
	type CreateBudgetRequest,
	type UUID,
} from "@/api";

export const useBudgetsStore = defineStore("budgets", () => {
	const budgets = ref<Budget[]>([]);
	const summaries = ref<Record<UUID, BudgetSummary>>({});
	const loading = ref(false);
	const error = ref<string | null>(null);

	async function load(): Promise<void> {
		loading.value = true;
		error.value = null;
		try {
			budgets.value = await budgetsApi.list();
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to load budgets";
		} finally {
			loading.value = false;
		}
	}

	async function loadSummary(budgetId: UUID): Promise<BudgetSummary> {
		const summary = await budgetsApi.getSummary(budgetId);
		summaries.value = { ...summaries.value, [budgetId]: summary };
		return summary;
	}

	async function create(payload: CreateBudgetRequest): Promise<Budget> {
		const created = await budgetsApi.create(payload);
		budgets.value = [...budgets.value, created];
		return created;
	}

	function reset(): void {
		budgets.value = [];
		summaries.value = {};
		error.value = null;
	}

	return {
		budgets,
		summaries,
		loading,
		error,
		load,
		loadSummary,
		create,
		reset,
	};
});
