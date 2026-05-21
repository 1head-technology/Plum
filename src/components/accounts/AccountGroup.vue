<template>
	<WCard :padding="20">
		<SectionHeader :eyebrow="eyebrow" :title="title">
			<template #action>
				<WButton variant="text" @click="$emit('manage')">manage →</WButton>
			</template>
		</SectionHeader>
		<div class="group-list">
			<div v-for="account in accounts" :key="account.id" class="group-row">
				<AvatarMark :size="44" />
				<div>
					<div class="group-row__name">{{ account.name }}</div>
					<div class="group-row__type">{{ account.type }}</div>
				</div>
				<WMoney
					:value="accountBalanceAmount(account)"
					:size="18"
					:weight="500"
					:tone="accountBalanceAmount(account) < 0 ? 'loss' : undefined"
					:currency="account.currency"
				/>
			</div>
		</div>
	</WCard>
</template>

<script setup lang="ts">
import { WCard, WButton, AvatarMark, WMoney, SectionHeader } from "@/components/ui";
import type { Account, AccountBalance, UUID } from "@/api";
import { toRef } from "vue";

const props = defineProps<{
	title: string;
	eyebrow: string;
	accounts: Account[];
	balances: Record<UUID, AccountBalance>;
}>();

defineEmits<{
	manage: [];
}>();

const title = toRef(props, "title");
const eyebrow = toRef(props, "eyebrow");
const accounts = toRef(props, "accounts");
const balances = toRef(props, "balances");

const accountBalanceAmount = (account) => {
	return balances.value[account.id]?.balance ?? account.initialBalance;
};
</script>

<style scoped>
.group-list {
	display: flex;
	flex-direction: column;
}
.group-row {
	display: grid;
	grid-template-columns: 44px 1fr auto;
	gap: 16px;
	padding: 16px 0;
	border-bottom: 1px solid var(--line);
	align-items: center;
}
.group-row__name {
	font-size: 14px;
	color: var(--ink);
	font-weight: 500;
}
.group-row__type {
	font-size: 11px;
	color: var(--fg-4);
	letter-spacing: 0.04em;
	margin-top: 3px;
}
</style>
