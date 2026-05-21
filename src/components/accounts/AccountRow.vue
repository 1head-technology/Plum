<template>
	<div class="account-row">
		<AvatarMark :size="36" />
		<div class="account-row__info">
			<div class="account-row__name">{{ account.name }}</div>
			<div class="account-row__detail">{{ account.type }}</div>
		</div>
		<WMoney :value="balance" :size="15" :weight="500" :tone="balance < 0 ? 'loss' : undefined" />
	</div>
</template>

<script setup lang="ts">
import { AvatarMark, WMoney } from "@/components/ui";
import type { Account } from "@/api";

defineProps<{
	account: Account;
	balance: number;
}>();
</script>

<style scoped>
.account-row {
	display: grid;
	grid-template-columns: 36px 1fr auto;
	gap: 12px;
	padding: 12px 0;
	border-bottom: 1px solid var(--line);
	align-items: center;
}
.account-row__name { font-size: 14px; color: var(--ink); font-weight: 500; }
.account-row__detail { font-size: 11px; color: var(--fg-4); letter-spacing: 0.04em; margin-top: 2px; }
</style>
