<template>
	<div class="txns">
		<p v-if="transactionsStore.loading">Loading transactions...</p>
		<p v-if="transactionsStore.error" class="error">{{ transactionsStore.error }}</p>

		<template v-if="!transactionsStore.loading">
			<!-- Filter chips -->
			<div class="txns__filters">
				<WChip :active="filter === 'all'" @click="filter = 'all'" :count="transactionsStore.ordered.length">All</WChip>
				<WChip :active="filter === 'income'" @click="filter = 'income'" :count="incomeCount">Income</WChip>
				<WChip :active="filter === 'expense'" @click="filter = 'expense'" :count="expenseCount">Expenses</WChip>
			</div>

			<!-- Summary strip -->
			<div class="txns__summary">
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
					v-for="tx in filtered"
					:key="tx.id"
					:tx="tx"
					:category-name="tx.categoryId ? categoriesStore.byId.get(tx.categoryId)?.name : null"
				/>
				</div>
			</WCard>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { WCard, WEyebrow, WMoney, WChip, SectionHeader } from "@/components/ui";
import TransactionRow from "@/components/transactions/TransactionRow.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import type { Transaction } from "@/api";

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();

const filter = ref("all");

const incomeTypes = ["INCOME", "TRANSFER_IN"];
const expenseTypes = ["EXPENSE", "TRANSFER_OUT"];

function isIncome(tx: Transaction) { return incomeTypes.includes(tx.type); }

const filtered = computed(() => {
	const txs = transactionsStore.ordered;
	if (filter.value === "income") return txs.filter(isIncome);
	if (filter.value === "expense") return txs.filter((t) => expenseTypes.includes(t.type));
	return txs;
});

const incomeCount = computed(() => transactionsStore.ordered.filter(isIncome).length);
const expenseCount = computed(() => transactionsStore.ordered.filter((t) => expenseTypes.includes(t.type)).length);
const totalIn = computed(() => transactionsStore.ordered.filter(isIncome).reduce((s, t) => s + Math.abs(t.amount), 0));
const totalOut = computed(() => transactionsStore.ordered.filter((t) => expenseTypes.includes(t.type)).reduce((s, t) => s - Math.abs(t.amount), 0));
</script>

<style scoped>
.txns {
	padding: 32px;
	display: flex;
	flex-direction: column;
	gap: 24px;
}
.txns__filters {
	display: flex;
	gap: 8px;
}
.txns__summary {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12px;
}
.error { color: var(--loss); }
</style>
