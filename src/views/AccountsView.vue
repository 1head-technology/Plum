<template>
	<div class="accounts">
		<p v-if="accountsStore.loading">Loading accounts...</p>
		<p v-if="accountsStore.error" class="error">{{ accountsStore.error }}</p>

		<template v-if="!accountsStore.loading">
			<!-- Summary cards -->
			<div class="accounts__summary">
				<WCard :padding="20">
					<WEyebrow>cash</WEyebrow>
					<div style="margin-top: 8px">
						<WMoney :value="sum(grouped.cash)" :size="26" :weight="500" />
					</div>
				</WCard>
				<WCard :padding="20">
					<WEyebrow>credit</WEyebrow>
					<div style="margin-top: 8px">
						<WMoney
							:value="sum(grouped.credit)"
							:size="26"
							:weight="500"
							:tone="sum(grouped.credit) < 0 ? 'loss' : undefined"
						/>
					</div>
				</WCard>
				<WCard :padding="20">
					<WEyebrow>investments</WEyebrow>
					<div style="margin-top: 8px">
						<WMoney :value="sum(grouped.invest)" :size="26" :weight="500" />
					</div>
				</WCard>
			</div>

			<!-- Account groups -->
			<AccountGroup
				v-if="grouped.cash.length"
				title="Cash"
				eyebrow="checking & savings"
				:accts="grouped.cash"
			/>
			<AccountGroup
				v-if="grouped.credit.length"
				title="Credit cards"
				eyebrow="credit"
				:accts="grouped.credit"
			/>
			<AccountGroup
				v-if="grouped.invest.length"
				title="Investments"
				eyebrow="brokerage & retirement"
				:accts="grouped.invest"
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

	<!-- New Account Modal -->
	<WModal
		v-model:is-open="isAddAccountModalOpen"
		title="Add new account"
		class="new-account-modal"
	>
		<form class="new-account-modal__form">
			<div class="new-account-modal__form-row">
				<input type="text" placeholder="Name" class="input" />
				<input type="text" placeholder="Type" class="input" />
			</div>
			<div class="new-account-modal__form-row">
				<input type="text" placeholder="Initial amount" class="input" />
				<input type="text" placeholder="Currency" class="input" />
			</div>
		</form>
	</WModal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { WCard, WEyebrow, WMoney, WButton, WModal } from "@/components/ui";
import AccountGroup from "@/components/AccountGroup.vue";
import { useAccountsStore } from "@/stores/accounts";
import { toDisplayAccount, type DisplayAccount } from "@/data/fixtures";

defineExpose({
	currentViewAddEntity,
});

const accountsStore = useAccountsStore();

const isAddAccountModalOpen = ref(false);

const displayAccounts = computed(() =>
	accountsStore.accounts.map((a) => toDisplayAccount(a, accountsStore.balances[a.id] ?? null)),
);

const grouped = computed(() => ({
	cash: displayAccounts.value.filter((a) => a.type === "checking" || a.type === "savings"),
	credit: displayAccounts.value.filter((a) => a.type === "credit"),
	invest: displayAccounts.value.filter((a) => a.type === "invest"),
}));

function sum(arr: DisplayAccount[]) {
	return arr.reduce((s, a) => s + a.balance, 0);
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
	grid-template-columns: repeat(3, 1fr);
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
