<template>
	<div class="accounts">
		<p v-if="accountsStore.loading">Loading accounts...</p>
		<p v-if="accountsStore.error" class="error">{{ accountsStore.error }}</p>

		<template v-if="!accountsStore.loading">
			<!-- Summary cards -->
			<div class="accounts__summary">
				<WCard v-for="group in accountsByType" :key="group.type" :padding="20">
					<WEyebrow>{{ typeLabels[group.type] }}</WEyebrow>
					<div style="margin-top: 8px">
						<WMoney
							:value="sumBalance(group.accounts)"
							:size="26"
							:weight="500"
							:tone="sumBalance(group.accounts) < 0 ? 'loss' : undefined"
						/>
					</div>
				</WCard>
			</div>

			<!-- Account groups -->
			<AccountGroup
				v-for="group in accountsByType"
				:key="group.type"
				:title="typeLabels[group.type]"
				:eyebrow="group.type.toLowerCase().replace(/_/g, ' ')"
				:accounts="group.accounts"
				:balances="accountsStore.balances"
				@manage="openManageDrawer(group.type)"
			/>

			<!-- Link account CTA -->
			<WCard tone="sunk" :padding="28" class="accounts__cta">
				<div>
					<WEyebrow>add</WEyebrow>
					<div class="accounts__cta-title">Connect another account.</div>
					<div class="accounts__cta-sub">
						Banks, brokerages, crypto — all in one place.
					</div>
				</div>
				<WButton variant="dark" icon="plus" size="lg">Link account</WButton>
			</WCard>
		</template>
	</div>

	<!-- Manage Accounts Drawer -->
	<ManageAccountsDrawer
		:open="isManageDrawerOpen"
		:group-label="manageDrawer.label"
		:group-eyebrow="manageDrawer.eyebrow"
		:initial-accounts="manageDrawer.accounts"
		:balances="accountsStore.balances"
		@close="isManageDrawerOpen = false"
	/>

	<!-- New Account Modal -->
	<WModal
		v-model:is-open="isAddAccountModalOpen"
		title="Add new account"
		class="new-account-modal"
	>
		<div class="new-account-modal__form-row">
			<WInput v-model:value="newAccount.name" label="name" placeholder="Checking account" />
		</div>
		<div class="new-account-modal__form-row">
			<WSelect
				v-model:value="newAccount.type"
				label="type"
				placeholder="Account type"
				:options="accountTypes"
				value-key="value"
				label-key="label"
			/>
		</div>
		<div class="new-account-modal__form-row">
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
		<div class="new-account-modal__form-row">
			<WInput
				v-model:value="newAccount.initialBalance"
				label="initial amount"
				placeholder="0.00"
				inputmode="decimal"
				:prefix="newAccount.currency"
			/>
		</div>

		<template #footer>
			<WButton @click="isAddAccountModalOpen = false" variant="ghost">Cancel</WButton>
			<WButton @click="onCreateNewAccount" variant="primary">Confirm</WButton>
		</template>
	</WModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { WCard, WEyebrow, WMoney, WButton, WModal, WInput, WSelect } from "@/components/ui";
import AccountGroup from "@/components/accounts/AccountGroup.vue";
import ManageAccountsDrawer from "@/components/accounts/ManageAccountsDrawer.vue";
import { useAccountsStore } from "@/stores/accounts";
import { currencyList } from "@/data/utils";
import { useSessionStore } from "@/stores/session";
import type { Account, AccountType, CreateAccountRequest } from "@/api";

defineExpose({ currentViewAddEntity });

const sessionStore = useSessionStore();
const accountsStore = useAccountsStore();

const typeLabels: Record<AccountType, string> = {
	CHECKING: "Checking",
	SAVINGS: "Savings",
	CREDIT_CARD: "Credit cards",
	CASH: "Cash",
	INVESTMENT: "Investments",
	BANK_ACCOUNT: "Bank accounts",
};

const accountsByType = computed(() => {
	const groups = new Map<AccountType, Account[]>();
	for (const account of accountsStore.accounts) {
		const existing = groups.get(account.type);
		if (existing) {
			existing.push(account);
		} else {
			groups.set(account.type, [account]);
		}
	}
	return [...groups.entries()].map(([type, accounts]) => ({ type, accounts }));
});

function sumBalance(accounts: Account[]) {
	return accounts.reduce((s, a) => {
		const bal = accountsStore.balances[a.id];
		return s + (bal ? bal.balance : a.initialBalance);
	}, 0);
}

// ---- Manage drawer ----
const isManageDrawerOpen = ref(false);
const manageDrawer = reactive({
	accounts: [] as Account[],
	label: "",
	eyebrow: "",
});

function openManageDrawer(type: AccountType) {
	manageDrawer.label = typeLabels[type];
	manageDrawer.eyebrow = type.toLowerCase().replace(/_/g, " ");
	manageDrawer.accounts = accountsStore.accounts.filter((a) => a.type === type);
	isManageDrawerOpen.value = true;
}

// ---- Add account modal ----
const isAddAccountModalOpen = ref(false);
const currencies = currencyList;
const accountTypes = [
	{ value: "CHECKING", label: "Checking" },
	{ value: "SAVINGS", label: "Savings" },
	{ value: "CREDIT_CARD", label: "Credit card" },
	{ value: "INVESTMENT", label: "Investment" },
];

const newAccount = reactive({
	name: "",
	type: "" as AccountType,
	currency: sessionStore.user?.defaultCurrency ?? "EUR",
	initialBalance: 0,
});

async function onCreateNewAccount() {
	const payload: CreateAccountRequest = {
		name: newAccount.name,
		type: newAccount.type,
		currency: newAccount.currency,
		initialBalance: newAccount.initialBalance,
	};
	await accountsStore.create(payload);
	isAddAccountModalOpen.value = false;
}

function currentViewAddEntity() {
	isAddAccountModalOpen.value = true;
}
</script>

<style scoped>
.accounts {
	padding: 32px;
	display: flex;
	flex-direction: column;
	gap: 24px;
}
.accounts__summary {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 12px;
}
.accounts__cta {
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.accounts__cta-title {
	font-size: 18px;
	color: var(--ink);
	margin-top: 8px;
}
.accounts__cta-sub {
	font-size: 13px;
	color: var(--fg-3);
	margin-top: 4px;
}
.error {
	color: var(--loss);
}

.new-account-modal__form-row {
	margin-bottom: 21px;
}
</style>
