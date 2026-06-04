<template>
	<div class="budgets">
		<p v-if="budgetsStore.loading">Loading budgets...</p>
		<p v-if="budgetsStore.error" class="error">{{ budgetsStore.error }}</p>

		<template v-if="!budgetsStore.loading">
			<div class="budgets__top">
				<!-- Donut summary -->
				<WCard :padding="28" class="budgets__donut-card">
					<WDonut :value="percentage" />
					<div>
						<WEyebrow>this month</WEyebrow>
						<div style="margin-top: 8px">
							<WMoney :value="-totalSpent" :size="36" :weight="500" />
						</div>
						<div class="budgets__of-cap">
							of
							<WMoney :value="totalCap" :size="13" :weight="500" tone="mute" /> budget
						</div>
						<div class="budgets__badges">
							<WBadge tone="gain" dot>on track</WBadge>
							<WBadge v-if="nearCapCount > 0" tone="warn">
								{{ nearCapCount }} categories near cap
							</WBadge>
						</div>
					</div>
				</WCard>

				<!-- Coaching card -->
				<WCard tone="tint" :padding="24">
					<WEyebrow color="var(--wise-deep)">quiet note</WEyebrow>
					<div class="budgets__note">
						Keep an eye on categories near their cap.
						<span style="font-family: var(--font-jp)">なんとかなる</span> — adjust or
						stay the course.
					</div>
					<div class="budgets__note-actions">
						<WButton variant="primary" size="sm">Raise cap</WButton>
						<WButton variant="ghost" size="sm">Dismiss</WButton>
					</div>
				</WCard>
			</div>

			<!-- Categories -->
			<WCard :padding="24" v-if="budgetLines.length">
				<SectionHeader eyebrow="categories" title="By category">
					<template #action>
						<WButton variant="ghost" icon="plus" size="sm">New budget</WButton>
					</template>
				</SectionHeader>
				<div class="budgets__grid">
					<BudgetRow v-for="line in budgetLines" :key="line.categoryId" :line="line" />
				</div>
			</WCard>

			<div
				v-if="!budgetLines.length && budgetsStore.budgets.length"
				style="padding: 16px; color: var(--fg-3); font-size: 14px"
			>
				Budgets loaded. Click a budget to see its category breakdown.
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { WCard, WEyebrow, WMoney, WBadge, WButton, WDonut, SectionHeader } from "@/components/ui";
import BudgetRow from "@/components/budgets/BudgetRow.vue";
import { useBudgetsStore } from "@/stores/budgets";
import type { CreateBudgetRequest } from "@/api";

// store
const budgetsStore = useBudgetsStore();

const thisMonth: String = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
const now = new Date();
const firstDayOfTheMonth: Date = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDayOfTheMonth: Date = new Date(now.getFullYear(), now.getMonth() + 1, 0);

// refs
const monthlyBudget: CreateBudgetRequest = reactive({
	name: thisMonth,
	from: firstDayOfTheMonth.toISOString(),
	to: lastDayOfTheMonth.toISOString(),
	lines: [],
});

watch(
	() => budgetsStore.budgets,
	(budgets) => {
		budgets.forEach((b) => {
			if (!budgetsStore.summaries[b.id]) {
				budgetsStore.loadSummary(b.id);
			}
		});
	},
	{ immediate: true },
);

const budgetLines = computed(() => Object.values(budgetsStore.summaries).flatMap((s) => s.lines));

const totalSpent = computed(() => budgetLines.value.reduce((s, l) => s + l.spent, 0));

const totalCap = computed(() => budgetLines.value.reduce((s, l) => s + l.planned, 0));

const percentage = computed(() =>
	totalCap.value > 0 ? (totalSpent.value / totalCap.value) * 100 : 0,
);

const nearCapCount = computed(
	() =>
		budgetLines.value.filter((l) => {
			const ratio = l.planned > 0 ? l.spent / l.planned : 0;
			return ratio > 0.8;
		}).length,
);

// functions
async function createMonthlyBudget() {
	await budgetsStore.create(monthlyBudget);
}
</script>

<style scoped>
.budgets {
	padding: 32px;

	display: flex;
	flex-direction: column;
	gap: 24px;
}
.budgets__top {
	display: grid;
	grid-template-columns: 1.2fr 1fr;
	gap: 16px;
}
.budgets__donut-card {
	display: flex;
	align-items: center;
	gap: 28px;
}
.budgets__of-cap {
	margin-top: 6px;

	font-size: 13px;
	color: var(--fg-3);
}
.budgets__badges {
	margin-top: 16px;

	display: flex;
	gap: 8px;
}
.budgets__note {
	margin-top: 12px;

	font-size: 17px;
	line-height: 1.5;
	color: var(--ink);
}
.budgets__note-actions {
	margin-top: 18px;

	display: flex;
	gap: 8px;
}
.budgets__grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 14px;
}
.error {
	color: var(--loss);
}
</style>
