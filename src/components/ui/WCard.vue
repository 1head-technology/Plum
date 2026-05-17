<template>
	<div class="w-card" :class="[`w-card--${tone}`, { 'w-card--hoverable': hoverable }]" :style="{ padding: `${padding}px` }">
		<slot />
	</div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	tone?: "paper" | "plain" | "ink" | "accent" | "tint" | "sunk";
	padding?: number;
	hoverable?: boolean;
}>(), {
	tone: "paper",
	padding: 20,
});
</script>

<style scoped>
.w-card {
	border-radius: 12px;
	box-shadow: var(--shadow-1);
	transition: box-shadow 120ms var(--ease-out);
}
.w-card--hoverable:hover { box-shadow: var(--shadow-2); }

.w-card--paper  { background: var(--paper-warm); border: 1px solid var(--line); color: var(--fg-1); }
.w-card--plain  { background: #ffffff; border: 1px solid var(--line); color: var(--fg-1); }
.w-card--ink    { background: var(--ink); color: var(--paper-warm); }
.w-card--accent { background: var(--wise); color: var(--paper-warm); }
.w-card--tint   { background: var(--wise-paper); border: 1px solid var(--wise-mist); color: var(--fg-1); }
.w-card--sunk   { background: var(--stone-100); color: var(--fg-1); }
</style>
