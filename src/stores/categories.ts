import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
	categoriesApi,
	type Category,
	type CreateCategoryRequest,
	type UUID,
} from "@/api";

export const useCategoriesStore = defineStore("categories", () => {
	const categories = ref<Category[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	const expenseCategories = computed(() =>
		categories.value.filter((c) => c.type === "EXPENSE"),
	);
	const incomeCategories = computed(() =>
		categories.value.filter((c) => c.type === "INCOME"),
	);

	const byId = computed<Map<UUID, Category>>(() => {
		const m = new Map<UUID, Category>();
		for (const c of categories.value) m.set(c.id, c);
		return m;
	});

	async function load(): Promise<void> {
		loading.value = true;
		error.value = null;
		try {
			categories.value = await categoriesApi.list();
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to load categories";
		} finally {
			loading.value = false;
		}
	}

	async function create(payload: CreateCategoryRequest): Promise<Category> {
		const created = await categoriesApi.create(payload);
		categories.value = [...categories.value, created];
		return created;
	}

	function reset(): void {
		categories.value = [];
		error.value = null;
	}

	return {
		categories,
		loading,
		error,
		expenseCategories,
		incomeCategories,
		byId,
		load,
		create,
		reset,
	};
});
