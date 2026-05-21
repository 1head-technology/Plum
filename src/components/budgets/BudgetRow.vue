<template>
	<div class="budget-row">
		<div class="budget-row__header">
			<div class="budget-row__cat">{{ line.categoryName }}</div>
			<div class="budget-row__amounts" :class="{ 'budget-row__amounts--over': over }">
				${{ line.spent }} / ${{ line.planned }}
			</div>
		</div>
		<div style="margin-top: 10px"><WBar :value="line.spent" :max="line.planned" :tone="tone" /></div>
		<div class="budget-row__footer">
			<span>{{ Math.round(pct) }}% spent</span>
			<span>{{ over ? `over by $${line.spent - line.planned}` : `$${line.planned - line.spent} left` }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WBar } from "@/components/ui";
import type { BudgetLineSummary } from "@/api";

const props = defineProps<{ line: BudgetLineSummary }>();

const pct = computed(() => props.line.planned > 0 ? Math.min(100, (props.line.spent / props.line.planned) * 100) : 0);
const over = computed(() => props.line.spent > props.line.planned);
const tone = computed(() => {
	const ratio = props.line.planned > 0 ? props.line.spent / props.line.planned : 0;
	return ratio > 1 ? "loss" : ratio > 0.8 ? "warn" : "accent";
});
</script>

<style scoped>
.budget-row {
	padding: 16px 18px;
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 10px;
}
.budget-row__header { display: flex; justify-content: space-between; align-items: baseline; }
.budget-row__cat { font-size: 13px; color: var(--ink); font-weight: 500; }
.budget-row__amounts { font-size: 12px; color: var(--fg-3); font-variant-numeric: tabular-nums; }
.budget-row__amounts--over { color: var(--loss); }
.budget-row__footer { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; color: var(--fg-4); }
</style>
