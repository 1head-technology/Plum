<template>
	<div class="tx-row">
		<AvatarMark :size="32" />
		<div class="tx-row__info">
			<div class="tx-row__name">{{ tx.description || tx.type }}</div>
			<div class="tx-row__cat">{{ categoryName || tx.type }}</div>
		</div>
		<WMoney :value="signedAmount" :size="14" :weight="500" signed :tone="signedAmount > 0 ? 'gain' : undefined" />
		<div class="tx-row__date">{{ formattedDate }}</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AvatarMark, WMoney } from "@/components/ui";
import type { Transaction } from "@/api";

const props = defineProps<{
	tx: Transaction;
	categoryName?: string | null;
}>();

const signedAmount = computed(() => {
	const isExpense = props.tx.type === "EXPENSE" || props.tx.type === "TRANSFER_OUT";
	return isExpense ? -Math.abs(props.tx.amount) : Math.abs(props.tx.amount);
});

const formattedDate = computed(() => {
	const d = new Date(props.tx.date);
	const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
	const day = String(d.getDate()).padStart(2, "0");
	return `${month} ${day}`;
});
</script>

<style scoped>
.tx-row {
	display: grid;
	grid-template-columns: 32px 1fr auto 80px;
	gap: 14px;
	padding: 12px 0;
	border-bottom: 1px solid var(--line);
	align-items: center;
}
.tx-row__name { font-size: 13px; color: var(--ink); font-weight: 500; }
.tx-row__cat { font-size: 11px; color: var(--fg-4); letter-spacing: 0.04em; text-transform: uppercase; margin-top: 2px; }
.tx-row__date { font-size: 12px; color: var(--fg-4); font-family: var(--font-mono); text-align: right; }
</style>
