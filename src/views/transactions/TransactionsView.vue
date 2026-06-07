<template>
	<div class="transactions-view">
		<p v-if="transactionsStore.loading">Loading transactions...</p>
		<p v-if="transactionsStore.error" class="error">{{ transactionsStore.error }}</p>

		<template v-if="!transactionsStore.loading">
			<!-- Filter chips -->
			<div class="transactions__filters">
				<WChip
					:active="filter === 'all'"
					@click="filter = 'all'"
					:count="transactionsStore.ordered.length"
					>All</WChip
				>
				<WChip :active="filter === 'income'" @click="filter = 'income'" :count="incomeCount"
					>Income</WChip
				>
				<WChip
					:active="filter === 'expense'"
					@click="filter = 'expense'"
					:count="expenseCount"
					>Expenses</WChip
				>
			</div>

			<!-- Summary strip -->
			<div class="transactions__summary">
				<WCard :padding="16">
					<WEyebrow>in</WEyebrow>
					<div style="margin-top: 4px">
						<WMoney :value="totalIn" :size="20" :weight="500" tone="gain" />
					</div>
				</WCard>
				<WCard :padding="16">
					<WEyebrow>out</WEyebrow>
					<div style="margin-top: 4px">
						<WMoney :value="totalOut" :size="20" :weight="500" tone="loss" />
					</div>
				</WCard>
				<WCard :padding="16">
					<WEyebrow>net</WEyebrow>
					<div style="margin-top: 4px">
						<WMoney
							:value="totalIn + totalOut"
							:size="20"
							:weight="500"
							:tone="totalIn + totalOut >= 0 ? 'gain' : 'loss'"
						/>
					</div>
				</WCard>
			</div>

			<!-- Transaction list -->
			<WCard :padding="20">
				<SectionHeader eyebrow="activity" title="All transactions" />
				<div>
					<TransactionRow
						v-for="transaction in filtered"
						:key="transaction.id"
						:transaction="transaction"
						:account-name="transactionAccount(transaction.accountId)"
						:category-name="
							transaction.categoryId
								? categoriesStore.byId.get(transaction.categoryId)?.name
								: null
						"
					/>
				</div>
			</WCard>
		</template>
	</div>

	<CreateTransactionModal
		v-model:is-open="isAddTransactionModalOpen"
		@submit="onCreateNewTransaction"
	/>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { WCard, WEyebrow, WMoney, WChip, SectionHeader } from "@/components/ui";
import TransactionRow from "@/components/transactions/TransactionRow.vue";
import CreateTransactionModal, {
	type CreateTransactionSubmit,
} from "@/views/transactions/CreateTransactionModal.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import { useAccountsStore } from "@/stores/accounts";
import type { Transaction, UUID } from "@/api";

defineExpose({ currentViewAddEntity });

// Stores
const transactionsStore = useTransactionsStore();
const accountsStore = useAccountsStore();
const categoriesStore = useCategoriesStore();

// Refs
const filter = ref("all");
const isAddTransactionModalOpen = ref(false);

const incomeTypes = ["INCOME", "TRANSFER_IN"];
const expenseTypes = ["EXPENSE", "TRANSFER_OUT"];

// Computed
const accounts = computed(() => accountsStore.accounts);

const filtered = computed(() => {
	const transactions = transactionsStore.ordered;

	if (filter.value === "income") {
		return transactions.filter(isIncome);
	}
	if (filter.value === "expense") {
		return transactions.filter((t) => expenseTypes.includes(t.type));
	}

	return transactions;
});

const incomeCount = computed(() => transactionsStore.ordered.filter(isIncome).length);
const expenseCount = computed(
	() => transactionsStore.ordered.filter((t) => expenseTypes.includes(t.type)).length,
);
const totalIn = computed(() =>
	transactionsStore.ordered.filter(isIncome).reduce((s, t) => s + Math.abs(t.amount), 0),
);
const totalOut = computed(() =>
	transactionsStore.ordered
		.filter((t) => expenseTypes.includes(t.type))
		.reduce((s, t) => s - Math.abs(t.amount), 0),
);

// Functions
async function onCreateNewTransaction(submission: CreateTransactionSubmit) {
	if (submission.kind === "transaction") {
		await transactionsStore.record(submission.payload);
	} else {
		await transactionsStore.recordTransfer(submission.payload);
	}
}

function transactionAccount(accountId: UUID) {
	const account = accounts.value.find((a) => a.id === accountId);

	return account ? account.name : "Unknown";
}

function currentViewAddEntity() {
	isAddTransactionModalOpen.value = true;
}

function isIncome(tx: Transaction) {
	return incomeTypes.includes(tx.type);
}
</script>

<style scoped>
.transactions-view {
	padding: 32px;
	display: flex;
	flex-direction: column;
	gap: 24px;
}
.transactions__filters {
	display: flex;
	gap: 8px;
}
.transactions__summary {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
}
.error {
	color: var(--loss);
}
</style>
