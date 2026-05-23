import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
	accountsApi,
	type Account,
	type AccountBalance,
	type CreateAccountRequest,
	type UUID,
} from "@/api";
import { useTransactionsStore } from "@/stores/transactions.ts";

export const useAccountsStore = defineStore("accounts", () => {
	const accounts = ref<Account[]>([]);
	const balances = ref<Record<UUID, AccountBalance>>({});
	const loading = ref(false);
	const error = ref<string | null>(null);

	const totalBalance = computed(() =>
		Object.values(balances.value).reduce((sum, b) => sum + Number(b.balance), 0),
	);

	function balanceFor(accountId: UUID): number | null {
		const value = balances.value[accountId];
		return value ? Number(value.balance) : null;
	}

	async function load(): Promise<void> {
		loading.value = true;
		error.value = null;

		try {
			accounts.value = await accountsApi.list();
			await Promise.all(accounts.value.map((a) => refreshBalance(a.id)));
		}
		catch (err) {
			error.value = err instanceof Error ? err.message : "Failed to load accounts";
		}
		finally {
			loading.value = false;
		}
	}

	async function refreshBalance(accountId: UUID): Promise<void> {
		const balance = await accountsApi.getBalance(accountId);
		balances.value = { ...balances.value, [accountId]: balance };
	}

	async function create(payload: CreateAccountRequest): Promise<Account> {
		const created = await accountsApi.create(payload);

		accounts.value = [...accounts.value, created];
		await refreshBalance(created.id);

		return created;
	}

	async function patch(accountId: UUID, payload: Partial<Account>): Promise<Account> {
		const patched = await accountsApi.patch(accountId, payload);

		accounts.value = accounts.value.map(a => (a.id === accountId ? patched : a));

		return patched;
	}

	async function remove(accountId: UUID): Promise<void> {
		await accountsApi.delete(accountId);

		accounts.value = accounts.value.filter(a => a.id !== accountId);

		// Recalculate total balance
		const { [accountId]: _removed, ...rest } = balances.value;
		balances.value = rest;

		// Remove transactions associated with the account
		const transactionStore = useTransactionsStore();
		transactionStore.transactions.filter((t) => t.accountId !== accountId);
	}

	function reset(): void {
		accounts.value = [];
		balances.value = {};
		error.value = null;
	}

	return {
		accounts,
		balances,
		loading,
		error,
		totalBalance,
		balanceFor,
		load,
		refreshBalance,
		create,
		patch,
		remove,
		reset,
	};
});
