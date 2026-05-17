import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
	transactionsApi,
	type RecordTransactionRequest,
	type RecordTransferRequest,
	type Transaction,
} from "@/api";

export const useTransactionsStore = defineStore("transactions", () => {
	const transactions = ref<Transaction[]>([]);
	const loading = ref(false);
	const error = ref<string | null>(null);

	const ordered = computed(() =>
		[...transactions.value].sort((a, b) => (a.date < b.date ? 1 : -1)),
	);

	async function load(): Promise<void> {
		loading.value = true;
		error.value = null;
		try {
			transactions.value = await transactionsApi.list();
		} catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to load transactions";
		} finally {
			loading.value = false;
		}
	}

	async function record(payload: RecordTransactionRequest): Promise<Transaction> {
		const created = await transactionsApi.record(payload);
		transactions.value = [created, ...transactions.value];
		return created;
	}

	async function recordTransfer(payload: RecordTransferRequest): Promise<Transaction[]> {
		const created = await transactionsApi.recordTransfer(payload);
		transactions.value = [...created, ...transactions.value];
		return created;
	}

	function reset(): void {
		transactions.value = [];
		error.value = null;
	}

	return {
		transactions,
		ordered,
		loading,
		error,
		load,
		record,
		recordTransfer,
		reset,
	};
});
