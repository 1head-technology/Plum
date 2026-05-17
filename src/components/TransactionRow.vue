<template>
	<div class="tx-row">
		<AvatarMark :size="32" :char="tx.amount > 0 ? 'る' : 'な'" :tone="tx.amount > 0 ? 'accent' : 'sunk'" />
		<div class="tx-row__info">
			<div class="tx-row__name">{{ tx.name }}</div>
			<div class="tx-row__cat">
				{{ tx.cat }}
				<WBadge v-if="tx.status === 'pending'" tone="warn" dot style="margin-left: 8px">pending</WBadge>
			</div>
		</div>
		<WMoney :value="tx.amount" :size="14" :weight="500" signed :tone="tx.amount > 0 ? 'gain' : undefined" />
		<div class="tx-row__date">{{ tx.date }}</div>
	</div>
</template>

<script setup lang="ts">
import { AvatarMark, WMoney, WBadge } from "@/components/ui";
import type { DisplayTransaction } from "@/data/fixtures";

defineProps<{ tx: DisplayTransaction }>();
</script>

<style scoped>
.tx-row {
	display: grid;
	grid-template-columns: 32px 1fr auto 80px;
	gap: 14px;
	padding: 12px 0;
	border-bottom: 1px solid var(--line);
	align-items: center;
}
.tx-row__name { font-size: 13px; color: var(--ink); font-weight: 500; }
.tx-row__cat { font-size: 11px; color: var(--fg-4); letter-spacing: 0.04em; text-transform: uppercase; margin-top: 2px; }
.tx-row__date { font-size: 12px; color: var(--fg-4); font-family: var(--font-mono); text-align: right; }
</style>
