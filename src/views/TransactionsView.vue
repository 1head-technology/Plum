<template>
	<div class="txns">
		<p v-if="transactionsStore.loading">Loading transactions...</p>
		<p v-if="transactionsStore.error" class="error">{{ transactionsStore.error }}</p>

		<template v-if="!transactionsStore.loading">
			<!-- Filter chips -->
			<div class="txns__filters">
				<WChip :active="filter === 'all'" @click="filter = 'all'" :count="displayTransactions.length">All</WChip>
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
					<TransactionRow v-for="tx in filtered" :key="tx.id" :tx="tx" />
				</div>
			</WCard>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { WCard, WEyebrow, WMoney, WChip, SectionHeader } from "@/components/ui";
import TransactionRow from "@/components/TransactionRow.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import { toDisplayTransaction } from "@/data/fixtures";

const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();

const filter = ref("all");

const displayTransactions = computed(() =>
	transactionsStore.ordered.map((tx) => {
		const catName = tx.categoryId ? categoriesStore.byId.get(tx.categoryId)?.name ?? null : null;
		return toDisplayTransaction(tx, catName);
	}),
);

const filtered = computed(() => {
	if (filter.value === "income") return displayTransactions.value.filter((t) => t.amount > 0);
	if (filter.value === "expense") return displayTransactions.value.filter((t) => t.amount < 0);
	return displayTransactions.value;
});

const incomeCount = computed(() => displayTransactions.value.filter((t) => t.amount > 0).length);
const expenseCount = computed(() => displayTransactions.value.filter((t) => t.amount < 0).length);
const totalIn = computed(() => displayTransactions.value.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0));
const totalOut = computed(() => displayTransactions.value.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0));
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
