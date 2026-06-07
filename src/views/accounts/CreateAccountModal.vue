<template>
	<WModal
		:is-open="isOpen"
		title="Add new account"
		class="create-account-modal"
		@update:is-open="$emit('update:isOpen', $event)"
	>
		<div class="create-account-modal__form-row">
			<WInput v-model:value="newAccount.name" label="name" placeholder="Checking account" />
		</div>
		<div class="create-account-modal__form-row">
			<WSelect
				v-model:value="newAccount.type"
				label="type"
				placeholder="Account type"
				:options="accountTypes"
				value-key="value"
				label-key="label"
			/>
		</div>
		<div class="create-account-modal__form-row">
			<WSelect
				v-model:value="newAccount.currency"
				label="currency"
				placeholder="Select currency"
				:options="currencies"
				value-key="code"
				label-key="code"
				description-key="name"
				searchable
			/>
		</div>
		<div class="create-account-modal__form-row">
			<WInput
				v-model:value="newAccount.initialBalance"
				label="initial amount"
				placeholder="0.00"
				inputmode="decimal"
				:prefix="newAccount.currency"
			/>
		</div>

		<template #footer>
			<WButton variant="ghost" @click="$emit('update:isOpen', false)">Cancel</WButton>
			<WButton variant="primary" :disabled="!canCreate" @click="onSubmit">Confirm</WButton>
		</template>
	</WModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import { WModal, WButton, WInput, WSelect } from "@/components/ui";
import { useSessionStore } from "@/stores/session";
import { currencyList } from "@/utilities/utilities";
import type { AccountType, CreateAccountRequest } from "@/api";

const props = defineProps<{
	isOpen: boolean;
}>();

const emit = defineEmits<{
	"update:isOpen": [value: boolean];
	submit: [value: CreateAccountRequest];
}>();

const sessionStore = useSessionStore();

const currencies = currencyList;
const defaultCurrency = () => sessionStore.user?.defaultCurrency ?? "EUR";

const accountTypes: { value: AccountType; label: string }[] = [
	{ value: "CHECKING", label: "Checking" },
	{ value: "SAVINGS", label: "Savings" },
	{ value: "CREDIT_CARD", label: "Credit card" },
	{ value: "CASH", label: "Cash" },
	{ value: "INVESTMENT", label: "Investment" },
	{ value: "BANK_ACCOUNT", label: "Bank account" },
];

const newAccount = reactive<CreateAccountRequest>({
	name: "",
	type: "" as AccountType,
	currency: defaultCurrency(),
	initialBalance: 0,
});

const canCreate = computed(() =>
	Boolean(
		newAccount.name
		&& newAccount.type
		&& newAccount.currency
	),
);

function onSubmit() {
	if (!canCreate.value) {
		return;
	}

	emit("submit", { ...newAccount });
	emit("update:isOpen", false);
}

function resetForm() {
	Object.assign(newAccount, {
		name: "",
		type: "" as AccountType,
		currency: defaultCurrency(),
		initialBalance: 0,
	});
}

// Reset the form each time the modal is closed so it reopens clean.
watch(
	() => props.isOpen,
	(open) => {
		if (!open) {
			resetForm();
		}
	},
);
</script>

<style scoped>
.create-account-modal__form-row {
	margin-bottom: 21px;
}
</style>
