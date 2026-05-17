<template>
	<div class="dash">
		<!-- Hero row -->
		<div class="dash__hero">
			<WCard :padding="24">
				<WEyebrow>net worth</WEyebrow>
				<div class="dash__net-row">
					<WMoney :value="netWorth" :size="44" :weight="500" />
					<WBadge tone="gain" dot>↑ this month</WBadge>
				</div>
				<div class="dash__subs">
					<div class="sub">
						<div class="sub__label">assets</div>
						<WMoney :value="totals.assets" :size="15" :weight="500" tone="mute" />
					</div>
					<div class="sub">
						<div class="sub__label">liabilities</div>
						<WMoney :value="totals.liabilities" :size="15" :weight="500" tone="mute" />
					</div>
					<div class="sub">
						<div class="sub__label">cash on hand</div>
						<WMoney :value="cashOnHand" :size="15" :weight="500" tone="mute" />
					</div>
				</div>
				<div style="margin-top: 22px">
					<MiniSparkline />
				</div>
			</WCard>

			<WCard tone="ink" :padding="24" class="dash__spending-card">
				<div>
					<WEyebrow color="rgba(247,245,240,0.5)">this month · spending</WEyebrow>
					<div style="margin-top: 12px">
						<WMoney :value="-spent" :size="36" :weight="500" style="color: var(--paper-warm)" />
					</div>
					<div class="dash__spending-under">spending this month</div>
				</div>
				<div>
					<WBar :value="spent" :max="cap || 1" tone="accent" />
					<div class="dash__spending-footer">
						<span>{{ spentPct }}% of budget</span>
						<span style="font-variant-numeric: tabular-nums">${{ cap.toLocaleString() }} cap</span>
					</div>
				</div>
			</WCard>

			<WCard tone="accent" :padding="24" class="dash__motivate-card">
				<WEyebrow color="rgba(247,245,240,0.7)">なんとかなる</WEyebrow>
				<div class="dash__motivate-text">You're on track this month. Keep going.</div>
				<div class="dash__motivate-glyph">な</div>
			</WCard>
		</div>

		<!-- Row 2 — accounts + goals -->
		<div class="dash__row2">
			<WCard :padding="20">
				<SectionHeader eyebrow="accounts" title="Your money">
					<template #action>
						<WButton variant="text" @click="$emit('navigate', 'accounts')">see all →</WButton>
					</template>
				</SectionHeader>
				<div class="dash__account-list">
					<AccountRow v-for="a in displayAccounts.slice(0, 4)" :key="a.id" :acct="a" />
				</div>
			</WCard>

			<WCard :padding="20">
				<SectionHeader eyebrow="savings goals" title="Goals">
					<template #action>
						<WButton variant="text" @click="$emit('navigate', 'goals')">edit →</WButton>
					</template>
				</SectionHeader>
				<div class="dash__goals-list">
					<div v-for="g in displayGoals.slice(0, 3)" :key="g.id">
						<div class="dash__goal-header">
							<span class="dash__goal-name">{{ g.name }}</span>
							<span class="dash__goal-amounts">${{ g.saved.toLocaleString() }} / ${{ g.target.toLocaleString() }}</span>
						</div>
						<WBar :value="g.saved" :max="g.target" :tone="g.tone" />
						<div class="dash__goal-tag">{{ g.tag }}</div>
					</div>
				</div>
			</WCard>
		</div>

		<!-- Row 3 — recent transactions -->
		<WCard :padding="20">
			<SectionHeader eyebrow="recent activity" title="Transactions">
				<template #action>
					<WButton variant="text" @click="$emit('navigate', 'transactions')">see all →</WButton>
				</template>
			</SectionHeader>
			<div>
				<TransactionRow v-for="tx in displayTransactions.slice(0, 6)" :key="tx.id" :tx="tx" />
			</div>
		</WCard>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WCard, WEyebrow, WBadge, WMoney, WBar, WButton, SectionHeader, WModal } from "@/components/ui";
import AccountRow from "@/components/AccountRow.vue";
import TransactionRow from "@/components/TransactionRow.vue";
import MiniSparkline from "@/components/MiniSparkline.vue";
import { useAccountsStore } from "@/stores/accounts";
import { useTransactionsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import { useBudgetsStore } from "@/stores/budgets";
import { useSavingsGoalsStore } from "@/stores/savingsGoals";
import { toDisplayAccount, toDisplayTransaction, toDisplayBudgetLine, toDisplayGoal } from "@/data/fixtures";

defineEmits<{ navigate: [id: string] }>();

const accountsStore = useAccountsStore();
const transactionsStore = useTransactionsStore();
const categoriesStore = useCategoriesStore();
const budgetsStore = useBudgetsStore();
const savingsStore = useSavingsGoalsStore();

const displayAccounts = computed(() =>
	accountsStore.accounts.map((a) => toDisplayAccount(a, accountsStore.balances[a.id] ?? null)),
);

const displayTransactions = computed(() =>
	transactionsStore.ordered.map((tx) => {
		const catName = tx.categoryId ? categoriesStore.byId.get(tx.categoryId)?.name ?? null : null;
		return toDisplayTransaction(tx, catName);
	}),
);

const displayGoals = computed(() =>
	savingsStore.goals.map(toDisplayGoal),
);

const budgetLines = computed(() => {
	const allLines = Object.values(budgetsStore.summaries).flatMap((s) => s.lines);
	return allLines.map(toDisplayBudgetLine);
});

const totals = computed(() => {
	return displayAccounts.value.reduce(
		(acc, a) => {
			if (a.type === "credit") acc.liabilities += a.balance;
			else acc.assets += a.balance;
			return acc;
		},
		{ assets: 0, liabilities: 0 },
	);
});
const netWorth = computed(() => totals.value.assets + totals.value.liabilities);
const cashOnHand = computed(() =>
	displayAccounts.value
		.filter((a) => a.type !== "invest" && a.type !== "credit")
		.reduce((s, a) => s + a.balance, 0),
);

const spent = computed(() => budgetLines.value.reduce((s, b) => s + b.spent, 0));
const cap = computed(() => budgetLines.value.reduce((s, b) => s + b.cap, 0));
const spentPct = computed(() => (cap.value > 0 ? Math.round((spent.value / cap.value) * 100) : 0));
</script>

<style scoped>
.dash {
	padding: 32px;
	display: flex;
	flex-direction: column;
	gap: 28px;
}

.dash__hero {
	display: grid;
	grid-template-columns: 1.4fr 1fr 0.9fr;
	gap: 16px;
}

.dash__net-row {
	display: flex;
	align-items: baseline;
	gap: 14px;
	margin-top: 14px;
}
.dash__subs {
	margin-top: 18px;
	display: flex;
	gap: 28px;
}
.sub__label {
	font-size: 11px;
	color: var(--fg-4);
	letter-spacing: 0.04em;
	text-transform: lowercase;
	margin-bottom: 4px;
}

.dash__spending-card {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}
.dash__spending-under {
	font-size: 12px;
	color: rgba(247, 245, 240, 0.65);
	margin-top: 6px;
}
.dash__spending-footer {
	display: flex;
	justify-content: space-between;
	margin-top: 8px;
	font-size: 11px;
	color: rgba(247, 245, 240, 0.65);
}

.dash__motivate-card {
	position: relative;
	overflow: hidden;
}
.dash__motivate-text {
	font-size: 17px;
	line-height: 1.4;
	color: var(--paper-warm);
	margin-top: 10px;
	max-width: 220px;
}
.dash__motivate-glyph {
	position: absolute;
	right: -10px;
	bottom: -30px;
	font-family: var(--font-jp);
	font-size: 140px;
	line-height: 1;
	color: rgba(247, 245, 240, 0.18);
	font-weight: 300;
	letter-spacing: -0.04em;
}

.dash__row2 {
	display: grid;
	grid-template-columns: 1.4fr 1fr;
	gap: 16px;
}
.dash__account-list {
	display: flex;
	flex-direction: column;
}
.dash__goals-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.dash__goal-header {
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	margin-bottom: 6px;
}
.dash__goal-name {
	font-size: 13px;
	color: var(--ink);
}
.dash__goal-amounts {
	font-size: 12px;
	color: var(--fg-3);
	font-variant-numeric: tabular-nums;
}
.dash__goal-tag {
	font-size: 11px;
	color: var(--fg-4);
	margin-top: 4px;
	letter-spacing: 0.04em;
}
</style>
