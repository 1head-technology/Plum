<template>
	<WModal
		:is-open="isOpen"
		title="Add new transaction"
		class="new-transaction-modal"
		@update:is-open="$emit('update:isOpen', $event)"
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
					<WInput v-model:value="newTransaction.amount" type="number" placeholder="0.00" />
				</div>
			</div>
			<div class="new-transaction-modal__form-row">
				<WInput v-model:value="newTransaction.description" placeholder="description" />
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
			<WButton variant="ghost" @click="$emit('update:isOpen', false)">Cancel</WButton>
			<WButton variant="primary" :disabled="!canRecord" @click="onSubmit">
				Confirm
			</WButton>
		</template>
	</WModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import {
	WModal,
	WButton,
	WInput,
	WSelect,
	WSegment,
	WSegmentButton,
} from "@/components/ui";
import type { SelectOption } from "@/components/ui/WSelect.vue";
import { useAccountsStore } from "@/stores/accounts";
import { useCategoriesStore } from "@/stores/categories";
import { useSessionStore } from "@/stores/session";
import { currencyList } from "@/utilities/utilities";
import type {
	ISODate,
	RecordTransactionRequest,
	RecordTransferRequest,
	TransactionType,
	UUID,
} from "@/api";

export type CreateTransactionSubmit =
	| { kind: "transaction"; payload: RecordTransactionRequest }
	| { kind: "transfer"; payload: RecordTransferRequest };

const props = defineProps<{
	isOpen: boolean;
}>();

const emit = defineEmits<{
	"update:isOpen": [value: boolean];
	submit: [value: CreateTransactionSubmit];
}>();

const accountsStore = useAccountsStore();
const categoriesStore = useCategoriesStore();
const sessionStore = useSessionStore();

const currencies = currencyList;
const defaultCurrency = () => sessionStore.user?.defaultCurrency ?? "EUR";

const selectedTransactionType = ref<"transaction" | "transfer">("transaction");

const newTransaction = reactive<RecordTransactionRequest>({
	accountId: "" as UUID,
	type: "EXPENSE" as TransactionType,
	amount: 0,
	currency: defaultCurrency(),
	date: new Date().toISOString() as ISODate,
	description: "",
	categoryId: "" as UUID,
	recurring: false,
});

const newTransfer = reactive<RecordTransferRequest>({
	sourceAccountId: "" as UUID,
	destinationAccountId: "" as UUID,
	amount: 0,
	currency: defaultCurrency(),
	date: new Date().toISOString() as ISODate,
	description: "",
});

const accountOptions = computed<SelectOption[]>(() =>
	accountsStore.accounts.map((a) => ({ value: a.id, label: a.name })),
);

const categoryOptions = computed<SelectOption[]>(() =>
	categoriesStore.categories.map((c) => ({ value: c.id, label: c.name })),
);

const sourceAccountOptions = computed<SelectOption[]>(() =>
	accountOptions.value.filter((a) => a !== newTransfer.destinationAccountId),
);

const destinationAccountOptions = computed<SelectOption[]>(() =>
	accountOptions.value.filter((a) => a !== newTransfer.sourceAccountId),
);

const canRecord = computed(() => {
	if (selectedTransactionType.value === "transaction") {
		return Boolean(
			newTransaction.accountId &&
				newTransaction.type &&
				newTransaction.amount > 0 &&
				newTransaction.currency &&
				newTransaction.date &&
				newTransaction.categoryId,
		);
	}
	return Boolean(
		newTransfer.sourceAccountId &&
			newTransfer.destinationAccountId &&
			newTransfer.amount > 0 &&
			newTransfer.currency &&
			newTransfer.date,
	);
});

function onSubmit() {
	if (!canRecord.value) {
		return;
	}

	if (selectedTransactionType.value === "transaction") {
		emit("submit", { kind: "transaction", payload: { ...newTransaction } });
	} else {
		emit("submit", { kind: "transfer", payload: { ...newTransfer } });
	}

	emit("update:isOpen", false);
}

function resetForms() {
	selectedTransactionType.value = "transaction";

	Object.assign(newTransaction, {
		accountId: "" as UUID,
		type: "EXPENSE" as TransactionType,
		amount: 0,
		currency: defaultCurrency(),
		date: new Date().toISOString() as ISODate,
		description: "",
		categoryId: "" as UUID,
		recurring: false,
	});

	Object.assign(newTransfer, {
		sourceAccountId: "" as UUID,
		destinationAccountId: "" as UUID,
		amount: 0,
		currency: defaultCurrency(),
		date: new Date().toISOString() as ISODate,
		description: "",
	});
}

// Reset the form each time the modal is closed so it reopens clean.
watch(
	() => props.isOpen,
	(open) => {
		if (!open) {
			resetForms();
		}
	},
);
</script>

<style scoped>
.new-transaction-modal__form-row {
	margin-bottom: 23px;
}
</style>
