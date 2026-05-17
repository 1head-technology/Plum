<template>
	<WCard :padding="20">
		<SectionHeader :eyebrow="eyebrow" :title="title">
			<template #action><WButton variant="text">manage →</WButton></template>
		</SectionHeader>
		<div class="group-list">
			<div v-for="a in accts" :key="a.id" class="group-row">
				<AvatarMark :size="44" :char="a.char" :tone="a.tone" />
				<div>
					<div class="group-row__name">{{ a.name }}</div>
					<div class="group-row__inst">{{ a.institution }}</div>
				</div>
				<div>
					<div class="group-row__sync-label">last sync</div>
					<div class="group-row__sync-time">2 min ago</div>
				</div>
				<WMoney :value="a.balance" :size="18" :weight="500" :tone="a.balance < 0 ? 'loss' : undefined" />
			</div>
		</div>
	</WCard>
</template>

<script setup lang="ts">
import { WCard, WButton, AvatarMark, WMoney, SectionHeader } from "@/components/ui";
import type { DisplayAccount } from "@/data/fixtures";

defineProps<{
	title: string;
	eyebrow: string;
	accts: DisplayAccount[];
}>();
</script>

<style scoped>
.group-list { display: flex; flex-direction: column; }
.group-row {
	display: grid;
	grid-template-columns: 44px 1fr 1fr auto;
	gap: 16px;
	padding: 16px 0;
	border-bottom: 1px solid var(--line);
	align-items: center;
}
.group-row__name { font-size: 14px; color: var(--ink); font-weight: 500; }
.group-row__inst { font-size: 11px; color: var(--fg-4); letter-spacing: 0.04em; text-transform: uppercase; margin-top: 3px; }
.group-row__sync-label { font-size: 11px; color: var(--fg-4); letter-spacing: 0.18em; text-transform: uppercase; }
.group-row__sync-time { font-size: 12px; color: var(--fg-3); margin-top: 2px; font-family: var(--font-mono); }
</style>
