<template>
	<div class="budget-row">
		<div class="budget-row__header">
			<div class="budget-row__cat">{{ b.cat }}</div>
			<div class="budget-row__amounts" :class="{ 'budget-row__amounts--over': over }">
				${{ b.spent }} / ${{ b.cap }}
			</div>
		</div>
		<div style="margin-top: 10px"><WBar :value="b.spent" :max="b.cap" :tone="b.tone" /></div>
		<div class="budget-row__footer">
			<span>{{ Math.round(pct) }}% spent</span>
			<span>{{ over ? `over by $${b.spent - b.cap}` : `$${b.cap - b.spent} left` }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WBar } from "@/components/ui";
import type { DisplayBudget } from "@/data/fixtures";

const props = defineProps<{ b: DisplayBudget }>();

const pct = computed(() => Math.min(100, (props.b.spent / props.b.cap) * 100));
const over = computed(() => props.b.spent > props.b.cap);
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
