<template>
	<WCard :padding="20">
		<SectionHeader :eyebrow="eyebrow" :title="title">
			<template #action>
				<WButton variant="text" @click="$emit('manage')">manage →</WButton>
			</template>
		</SectionHeader>
		<div class="group-list">
			<AccountRow
				v-for="account in accounts"
				:key="account.id"
				:account="account"
				:balance="accountBalanceAmount(account)"
				@edit="(a) => $emit('edit', a)"
			/>
		</div>
	</WCard>
</template>

<script setup lang="ts">
import { WCard, WButton, SectionHeader } from "@/components/ui";
import AccountRow from "./AccountRow.vue";
import type { Account, AccountBalance, UUID } from "@/api";

const props = defineProps<{
	title: string;
	eyebrow: string;
	accounts: Account[];
	balances: Record<UUID, AccountBalance>;
}>();

defineEmits<{
	manage: [];
	edit: [account: Account];
}>();

const accountBalanceAmount = (account: Account) => {
	return props.balances[account.id]?.balance ?? account.initialBalance;
};
</script>

<style scoped>
.group-list {
	display: flex;
	flex-direction: column;
}
</style>
