<template>
	<div class="topbar">
		<div class="topbar__left">
			<WEyebrow v-if="eyebrow">{{ eyebrow }}</WEyebrow>
			<div class="topbar__title">{{ title }}</div>
		</div>
		<div v-if="!hideSearch" class="topbar__search">
			<WInput icon="search" placeholder="Search transactions, accounts…" :model-value="search" @update:model-value="$emit('update:search', $event)" />
		</div>
		<slot name="actions" />
	</div>
</template>

<script setup lang="ts">
import { WEyebrow, WInput } from "@/components/ui";

withDefaults(defineProps<{
	title: string;
	eyebrow?: string;
	search?: string;
	hideSearch?: boolean;
}>(), {
	search: "",
});

defineEmits<{ "update:search": [value: string] }>();
</script>

<style scoped>
.topbar {
	display: flex;
	align-items: center;
	gap: 16px;
	padding: 20px 32px;
	border-bottom: 1px solid var(--line);
	background: var(--paper);
}
.topbar__left { flex: 1; min-width: 0; }
.topbar__title {
	font-size: 24px;
	font-weight: 500;
	color: var(--ink);
	letter-spacing: -0.01em;
	margin-top: 4px;
}
.topbar__search { width: 280px; }
</style>
