<template>
	<div class="account-row">
		<AvatarMark :size="36" :char="acct.char" :tone="acct.tone" />
		<div class="account-row__info">
			<div class="account-row__name">{{ acct.name }}</div>
			<div class="account-row__detail">{{ acct.institution }} · {{ typeLabel }}</div>
		</div>
		<WMoney :value="acct.balance" :size="15" :weight="500" :tone="acct.balance < 0 ? 'loss' : undefined" />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AvatarMark, WMoney } from "@/components/ui";
import type { DisplayAccount } from "@/data/fixtures";

const props = defineProps<{ acct: DisplayAccount }>();

const typeLabels: Record<string, string> = {
	checking: "CHECKING",
	savings: "SAVINGS",
	credit: "CREDIT CARD",
	invest: "INVESTMENT",
};
const typeLabel = computed(() => typeLabels[props.acct.type] || props.acct.type.toUpperCase());
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
