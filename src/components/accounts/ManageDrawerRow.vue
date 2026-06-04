<template>
	<div role="listitem" class="drawer-row" :class="{ 'drawer-row--expanded': expanded }">
		<!-- primary row -->
		<div class="drawer-row__primary" @click="onPrimaryClick">
			<AvatarMark :size="38" />

			<div class="drawer-row__info">
				<div class="drawer-row__name">{{ account.name }}</div>
				<div class="drawer-row__meta">{{ account.type }} · {{ account.currency }}</div>
			</div>

			<WMoney
				:value="balance"
				:size="14.5"
				:weight="500"
				:tone="balance < 0 ? 'loss' : undefined"
				:currency="account.currency"
			/>

			<ChevronDown
				:size="14"
				class="drawer-row__chevron"
				:class="{ 'drawer-row__chevron--open': expanded }"
			/>
		</div>

		<!-- expanded detail -->
		<div v-if="expanded" class="drawer-row__detail">
			<WInput v-model:value="editName as string" label="name" size="sm" />
			<WSelect
				v-model:value="editType as AccountType"
				label="type"
				:options="accountTypeOptions"
				value-key="value"
				label-key="label"
				size="sm"
			/>
			<WSelect
				v-model:value="editCurrency as string"
				label="currency"
				:options="currencies"
				value-key="code"
				label-key="code"
				description-key="name"
				size="sm"
				searchable
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ChevronDown } from "lucide-vue-next";
import { AvatarMark, WMoney, WInput, WSelect } from "@/components/ui";
import { currencyList } from "@/utilities/utilities";
import type { Account, AccountType } from "@/api";

const props = defineProps<{
	account: Account;
	balance: number;
	expanded: boolean;
}>();

const emit = defineEmits<{
	toggleExpand: [];
	update: [patch: Partial<Account>];
}>();

const currencies = currencyList;

const accountTypeOptions: { value: AccountType; label: string }[] = [
	{ value: "CHECKING", label: "Checking" },
	{ value: "SAVINGS", label: "Savings" },
	{ value: "CREDIT_CARD", label: "Credit card" },
	{ value: "CASH", label: "Cash" },
	{ value: "INVESTMENT", label: "Investment" },
	{ value: "BANK_ACCOUNT", label: "Bank" },
];

// ---- Local edit state ----
const editName = ref(props.account.name);
const editType = ref(props.account.type);
const editCurrency = ref(props.account.currency);

// Sync local state when account prop changes or row is opened
watch(
	() => props.expanded,
	(open) => {
		if (open) {
			editName.value = props.account.name;
			editType.value = props.account.type;
			editCurrency.value = props.account.currency;
		}
	},
);

// Emit changes on any edit
watch(editName, (val) => {
	if (val.trim() && val !== props.account.name) {
		emit("update", { name: val.trim() });
	}
});

watch(editType, (val) => {
	if (val !== props.account.type) {
		emit("update", { type: val as AccountType });
	}
});

watch(editCurrency, (val) => {
	if (val !== props.account.currency) {
		emit("update", { currency: val });
	}
});

function onPrimaryClick() {
	emit("toggleExpand");
}
</script>

<style scoped>
.drawer-row {
	padding: 12px;
	border-radius: 10px;
	background: transparent;
	border: 1px solid transparent;
	margin-bottom: 4px;
	transition:
		background 140ms var(--ease-out),
		border-color 140ms var(--ease-out);
}
.drawer-row--expanded {
	background: var(--paper-warm);
	border-color: var(--wise-mist);
}

/* ---- Primary row ---- */
.drawer-row__primary {
	display: grid;
	grid-template-columns: 38px 1fr auto 16px;
	gap: 12px;
	align-items: center;
	cursor: pointer;
}

/* ---- Name / meta ---- */
.drawer-row__info {
	min-width: 0;
}
.drawer-row__name {
	font-family: var(--font-sans);
	font-size: 14.5px;
	color: var(--ink);
	font-weight: 500;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.drawer-row__meta {
	font-size: 10.5px;
	color: var(--fg-4);
	letter-spacing: 0.06em;
	text-transform: uppercase;
	margin-top: 2px;
}

/* ---- Chevron ---- */
.drawer-row__chevron {
	color: var(--fg-4);
	transition: transform 160ms var(--ease-out);
	flex-shrink: 0;
}
.drawer-row__chevron--open {
	transform: rotate(180deg);
}

/* ---- Expanded detail ---- */
.drawer-row__detail {
	margin-top: 14px;
	padding-top: 14px;
	border-top: 1px solid var(--line);
	display: flex;
	flex-direction: column;
	gap: 14px;
}
</style>
