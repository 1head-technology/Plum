<template>
	<div class="tx-row">
		<AvatarMark :size="32" />
		<div class="tx-row__info">
			<div class="tx-row__desc">{{ accountName }}</div>
			<div class="tx-row__cat">
				{{ categoryName || transaction.type }} • {{ transaction.description }}
			</div>
		</div>
		<WMoney
			:value="signedAmount"
			:size="14"
			:weight="500"
			signed
			:tone="signedAmount > 0 ? 'gain' : undefined"
		/>
		<div class="tx-row__date flex flex--column">
			{{ formattedDate }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { AvatarMark, WMoney } from "@/components/ui";
import type { Transaction } from "@/api";

const props = defineProps<{
	transaction: Transaction;
	accountName?: string | null;
	categoryName?: string | null;
}>();

const transaction = toRef(props, "transaction");
const accountName = toRef(props, "accountName");
const categoryName = toRef(props, "categoryName");

const signedAmount = computed(() => {
	const isExpense =
		transaction.value.type === "EXPENSE" || transaction.value.type === "TRANSFER_OUT";
	return isExpense ? -Math.abs(transaction.value.amount) : Math.abs(transaction.value.amount);
});

const formattedDate = computed(() => {
	const d = new Date(transaction.value.date);
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
.tx-row__name {
	font-size: 13px;
	color: var(--ink);
	font-weight: 500;
}
.tx-row__cat {
	font-size: 11px;
	color: var(--fg-4);
	letter-spacing: 0.04em;
	text-transform: uppercase;
	margin-top: 2px;
}
.tx-row__date {
	font-size: 12px;
	color: var(--fg-4);
	font-family: var(--font-mono);
	text-align: right;
}
</style>
