<template>
	<div class="tx-row">
		<AvatarMark :size="32" />
		<div class="tx-row__info">
			<div class="tx-row__name">{{ transaction.description || transaction.type }}</div>
			<div class="tx-row__cat">{{ categoryName || transaction.type }}</div>
		</div>
		<div class="flex flex--column align-end">
			<div class="tx-row__date">{{ formattedDate }}</div>
			<WMoney
				:value="signedAmount"
				:size="14"
				:weight="500"
				signed
				:tone="signedAmount > 0 ? 'gain' : undefined"
			/>
		</div>
		<button
			class="tx-row__action"
			aria-label="Edit transaction"
			@click="$emit('edit', transaction)"
		>
			<Pencil :size="15" />
		</button>
		<button
			class="tx-row__action tx-row__action--danger"
			aria-label="Delete transaction"
			@click="isConfirmOpen = true"
		>
			<Trash2 :size="16" />
		</button>
	</div>

	<!-- Delete Transaction Modal -->
	<WModal v-model:is-open="isConfirmOpen" title="Delete transaction" size="sm">
		<p class="tx-row__confirm-text">
			Are you sure you want to delete
			<strong>{{ transaction.description || transaction.type }}</strong>
			? This action cannot be undone.
		</p>
		<template #footer>
			<WButton variant="ghost" :disabled="deleting" @click="isConfirmOpen = false">
				Cancel
			</WButton>
			<WButton variant="loss" :disabled="deleting" @click="onConfirmDelete">
				{{ deleting ? "Deleting..." : "Delete" }}
			</WButton>
		</template>
	</WModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Pencil, Trash2 } from "lucide-vue-next";
import { AvatarMark, WMoney, WModal, WButton } from "@/components/ui";
import { useTransactionsStore } from "@/stores/transactions";
import type { Transaction } from "@/api";

const props = defineProps<{
	transaction: Transaction;
	categoryName?: string | null;
}>();

defineEmits<{
	edit: [transaction: Transaction];
}>();

const transactionsStore = useTransactionsStore();
const isConfirmOpen = ref(false);
const deleting = ref(false);

const signedAmount = computed(() => {
	const isExpense =
		props.transaction.type === "EXPENSE" || props.transaction.type === "TRANSFER_OUT";
	return isExpense ? -Math.abs(props.transaction.amount) : Math.abs(props.transaction.amount);
});

const formattedDate = computed(() => {
	const d = new Date(props.transaction.date);
	const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
	const day = String(d.getDate()).padStart(2, "0");

	return `${month} ${day}`;
});

async function onConfirmDelete() {
	deleting.value = true;

	try {
		await transactionsStore.remove(props.transaction.id);
		isConfirmOpen.value = false;
	} finally {
		deleting.value = false;
	}
}
</script>

<style scoped>
.tx-row {
	display: grid;
	grid-template-columns: 32px 1fr 80px auto auto;
	gap: 19px;

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
	font-family: var(--font-mono), monospace;
	text-align: right;
}

.tx-row__action {
	display: flex;
	align-items: center;
	justify-content: center;

	width: 28px;
	height: 28px;

	border: none;
	border-radius: 8px;

	background: transparent;
	color: var(--fg-3);
	cursor: pointer;
	transition:
		background 120ms var(--ease-out),
		color 120ms var(--ease-out);
}
.tx-row__action:hover {
	background: var(--stone-100);
	color: var(--ink);
}
.tx-row__action--danger:hover {
	color: var(--loss, #b3261e);
}

.tx-row__confirm-text {
	margin: 0;
	color: var(--fg-1);
	font-size: 14px;
	line-height: 1.5;
}
</style>
