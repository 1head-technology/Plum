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
				@edit="onEditAccount"
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
		:initial-expanded-id="manageDrawer.expandedId"
		:balances="accountsStore.balances"
		@patch="onPatchAccounts"
		@close="isManageDrawerOpen = false"
	/>

	<!-- New Account Modal -->
	<CreateAccountModal
		v-model:is-open="isAddAccountModalOpen"
		@submit="onCreateNewAccount"
	/>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { WCard, WEyebrow, WMoney, WButton } from "@/components/ui";
import AccountGroup from "@/components/accounts/AccountGroup.vue";
import ManageAccountsDrawer from "@/components/accounts/ManageAccountsDrawer.vue";
import CreateAccountModal from "@/views/accounts/CreateAccountModal.vue";
import { useAccountsStore } from "@/stores/accounts";
import type { Account, AccountType, CreateAccountRequest } from "@/api";

defineExpose({ currentViewAddEntity });

const accountsStore = useAccountsStore();

// Const
const typeLabels: Record<AccountType, string> = {
	CHECKING: "Checking",
	SAVINGS: "Savings",
	CREDIT_CARD: "Credit cards",
	CASH: "Cash",
	INVESTMENT: "Investments",
	BANK_ACCOUNT: "Bank accounts",
};

// Refs
const isManageDrawerOpen = ref(false);
const isAddAccountModalOpen = ref(false);
const manageDrawer = reactive({
	accounts: [] as Account[],
	label: "",
	eyebrow: "",
	expandedId: null as string | null,
});

// Computed
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

// Functions
async function onCreateNewAccount(payload: CreateAccountRequest) {
	await accountsStore.create(payload);
}

function onPatchAccounts(accounts: Account[]) {
	for (const account of accounts) {
		accountsStore.patch(account.id, {
			name: account.name,
			type: account.type,
			currency: account.currency,
			initialBalance: account.initialBalance,
		});
	}
}

function sumBalance(accounts: Account[]) {
	return accounts.reduce((s, a) => {
		const bal = accountsStore.balances[a.id];
		return s + (bal ? bal.balance : a.initialBalance);
	}, 0);
}

function openManageDrawer(type: AccountType, expandedId: string | null = null) {
	manageDrawer.label = typeLabels[type];
	manageDrawer.eyebrow = type.toLowerCase().replace(/_/g, " ");
	manageDrawer.accounts = accountsStore.accounts.filter((a) => a.type === type);
	manageDrawer.expandedId = expandedId;
	isManageDrawerOpen.value = true;
}

function onEditAccount(account: Account) {
	openManageDrawer(account.type, account.id);
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
</style>
