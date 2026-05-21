<template>
	<button
		class="w-chip"
		:class="{ 'w-chip--active': active }"
		@click="$emit('click', $event)">
		<slot />
		<span v-if="count" class="w-chip__count">· {{ count }}</span>
	</button>
</template>

<script setup lang="ts">
defineProps<{
	active?: boolean;
	count?: number;
}>();

defineEmits<{ click: [e: MouseEvent] }>();
</script>

<style scoped>
.w-chip {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 6px 12px;
	border-radius: 999px;
	font-size: 12px;
	font-family: var(--font-sans);
	background: var(--paper-warm);
	color: var(--fg-2);
	border: 1px solid var(--line);
	cursor: pointer;
	transition: all 120ms var(--ease-out);
}
.w-chip--active {
	background: var(--ink);
	color: var(--paper-warm);
	border-color: var(--ink);
}
.w-chip__count {
	opacity: 0.6;
	font-variant-numeric: tabular-nums;
}
</style>
