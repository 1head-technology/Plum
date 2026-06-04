<template>
	<div class="txns">
		<p v-if="transactionsStore.loading">Loading transactions...</p>
		<p v-if="transactionsStore.error" class="error">{{ transactionsStore.error }}</p>

		<template v-if="!transactionsStore.loading">
			<!-- Filter chips -->
			<div class="txns__filters">
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
						v-for="transaction in filtered"
						:key="transaction.id"
						:transaction="transaction"
						:account-name="transactionAccount(transaction.accountId)"
						:category-name="
							transaction.categoryId ? categoriesStore.byId.get(transaction.categoryId)?.name : null
						"
					/>
				</div>
			</WCard>
		</template>
	</div>

	<WModal
		v-model:is-open="isAddTransactionModal"
		title="Add new transaction"
		class="new-transaction-modal"
	>
		<div class="new-transaction-modal__form-row flex justify-center">
			<WSegment v-model:value="selectedTransactionType">
				<WSegmentButton color="dark" value="transaction">transaction</WSegmentButton>
				<WSegmentButton color="dark" value="transfer">transfer</WSegmentButton>
			</WSegment>
		</div>

		<template v-if="selectedTransactionType === 'transaction'">
			<div class="new-transaction-modal__form-row">
				<WSelect v-model:value="newTransaction.accountId" :options="accountOptions" />
			</div>
			<div class="new-transaction-modal__form-row">
				<WSegment v-model:value="newTransaction.type">
					<WSegmentButton value="EXPENSE">Expense</WSegmentButton>
					<WSegmentButton value="INCOME">Income</WSegmentButton>
				</WSegment>
			</div>
			<div class="new-transaction-modal__form-row flex gap-2">
				<div class="w-30">
					<WSelect
						v-model:value="newTransaction.currency"
						:options="currencies"
						value-key="code"
						label-key="code"
						searchable
					/>
				</div>
				<div class="w-70">
					<WInput
						v-model:value="newTransaction.amount"
						type="number"
						placeholder="0.00"
					/>
				</div>
			</div>
			<div class="new-transaction-modal__form-row">
				<WInput v-model:value="newTransaction.description" placeholder="description">
				</WInput>
			</div>
			<div class="new-transaction-modal__form-row">
				<WSelect
					v-model:value="newTransaction.categoryId"
					:options="categoryOptions"
					searchable
				/>
			</div>
		</template>

		<template v-if="selectedTransactionType === 'transfer'">
			<div class="new-transaction-modal__form-row flex gap-2">
				<div class="flex-1">
					<WSelect
						v-model:value="newTransfer.sourceAccountId"
						:options="sourceAccountOptions"
					/>
				</div>
				<div class="flex-1">
					<WSelect
						v-model:value="newTransfer.destinationAccountId"
						:options="destinationAccountOptions"
					/>
				</div>
			</div>
			<div class="new-transaction-modal__form-row flex gap-2">
				<div class="w-30">
					<WSelect
						v-model:value="newTransfer.currency"
						:options="currencies"
						value-key="code"
						label-key="code"
						searchable
					/>
				</div>
				<div class="w-70">
					<WInput v-model:value="newTransfer.amount" type="number" placeholder="0.00" />
				</div>
			</div>
			<div class="new-transaction-modal__form-row">
				<WInput v-model:value="newTransfer.description" placeholder="description" />
			</div>
		</template>

		<template #footer>
			<WButton @click="isAddTransactionModal = false" variant="ghost">Cancel</WButton>
			<WButton
				@click="onCreateNewTransaction"
				variant="primary"
				:disabled="!canRecordTransaction"
			>
				Confirm
			</WButton>
		</template>
	</WModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
	WCard,
	WEyebrow,
	WMoney,
	WChip,
	SectionHeader,
	WModal,
	WButton,
	WInput,
	WSelect,
	WSegment,
	WSegmentButton,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/WSelect.vue";
import TransactionRow from "@/components/transactions/TransactionRow.vue";
import { useTransactionsStore } from "@/stores/transactions";
import { useCategoriesStore } from "@/stores/categories";
import type {
	ISODate,
	RecordTransactionRequest,
	RecordTransferRequest,
	Transaction,
	TransactionType,
	UUID,
} from "@/api";
import { useSessionStore } from "@/stores/session.ts";
import { useAccountsStore } from "@/stores/accounts.ts";
import { currencyList } from "@/utilities/utilities.js";

defineExpose({ currentViewAddEntity });

// Stores
const transactionsStore = useTransactionsStore();
const accountsStore = useAccountsStore();
const categoriesStore = useCategoriesStore();
const sessionStore = useSessionStore();

// Const
const currencies = currencyList;

// Refs
const filter = ref("all");
const isAddTransactionModal = ref(false);
const selectedTransactionType = ref<"transaction" | "transfer">("transaction");
const newTransaction = reactive<RecordTransactionRequest>({
	accountId: "" as UUID,
	type: "EXPENSE" as TransactionType,
	amount: 0 as number,
	currency: sessionStore.user?.defaultCurrency ?? ("EUR" as string),
	date: new Date().toISOString() as ISODate,
	description: "" as string,
	categoryId: "" as UUID,
	recurring: false,
});
const newTransfer = reactive<RecordTransferRequest>({
	sourceAccountId: "" as UUID,
	destinationAccountId: "" as UUID,
	amount: 0 as number,
	currency: sessionStore.user?.defaultCurrency ?? ("EUR" as string),
	date: new Date().toISOString() as ISODate,
	description: "" as string,
});

const incomeTypes = ["INCOME", "TRANSFER_IN"];
const expenseTypes = ["EXPENSE", "TRANSFER_OUT"];

// Computed
const accounts = computed(() => accountsStore.accounts);

const categories = computed(() => categoriesStore.categories);

const accountOptions = computed<SelectOption[]>(() =>
	accounts.value.map((a) => ({ value: a.id, label: a.name })),
);

const categoryOptions = computed<SelectOption[]>(() =>
	categories.value.map((c) => ({ value: c.id, label: c.name })),
);

const sourceAccountOptions = computed<SelectOption[]>(() =>
	accounts.value
		.map((a) => ({ value: a.id, label: a.name }))
		.filter((a) => a.value !== newTransfer.destinationAccountId),
);

const destinationAccountOptions = computed<SelectOption[]>(() =>
	accounts.value
		.map((a) => ({ value: a.id, label: a.name }))
		.filter((a) => a.value !== newTransfer.sourceAccountId),
);

const filtered = computed(() => {
	const txs = transactionsStore.ordered;
	if (filter.value === "income") {
		return txs.filter(isIncome);
	}
	if (filter.value === "expense") {
		return txs.filter((t) => expenseTypes.includes(t.type));
	}
	return txs;
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

const canRecordTransaction = computed(() => {
	if (selectedTransactionType.value === "transaction") {
		return (
			newTransaction.accountId &&
			newTransaction.type &&
			newTransaction.amount > 0 &&
			newTransaction.currency &&
			newTransaction.date &&
			newTransaction.categoryId
		);
	} else if (selectedTransactionType.value === "transfer") {
		return (
			newTransfer.sourceAccountId &&
			newTransfer.destinationAccountId &&
			newTransfer.amount > 0 &&
			newTransfer.currency &&
			newTransfer.date
		);
	}

	return false;
});

// Functions
async function onCreateNewTransaction() {
	if (selectedTransactionType.value === "transaction") {
		const payload: RecordTransactionRequest = { ...newTransaction };

		await transactionsStore.record(payload);
	} else if (selectedTransactionType.value === "transfer") {
		const payload: RecordTransferRequest = { ...newTransfer };

		await transactionsStore.recordTransfer(payload);
	}

	clearForms();
	isAddTransactionModal.value = false;
}

function transactionAccount(accountId: UUID) {
	const account = accounts.value.find((a) => a.id === accountId);

	return account ? account.name : "Unknown";
}

function currentViewAddEntity() {
	isAddTransactionModal.value = true;
}

function isIncome(tx: Transaction) {
	return incomeTypes.includes(tx.type);
}

function clearForms() {
	newTransaction.accountId = "" as UUID;
	newTransaction.type = "EXPENSE" as TransactionType;
	newTransaction.amount = 0 as number;
	newTransaction.currency = sessionStore.user?.defaultCurrency ?? ("EUR" as string);
	newTransaction.date = new Date().toISOString() as ISODate;
	newTransaction.description = "" as string;
	newTransaction.categoryId = "" as UUID;
	newTransaction.recurring = false;

	newTransfer.sourceAccountId = "" as UUID;
	newTransfer.destinationAccountId = "" as UUID;
	newTransfer.amount = 0 as number;
	newTransfer.currency = sessionStore.user?.defaultCurrency ?? ("EUR" as string);
	newTransfer.date = new Date().toISOString() as ISODate;
	newTransfer.description = "" as string;
}
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
.error {
	color: var(--loss);
}

.new-transaction-modal__form-row {
	margin-bottom: 23px;
}
</style>
