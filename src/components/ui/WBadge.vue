<template>
	<span class="w-badge" :class="`w-badge--${tone}`">
		<span v-if="dot" class="w-badge__dot" />
		<slot />
	</span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	tone?: "gain" | "loss" | "warn" | "info" | "neutral";
	dot?: boolean;
}>(), {
	tone: "neutral",
});
</script>

<style scoped>
.w-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 4px 10px;
	border-radius: 999px;
	font-size: 11px;
	font-weight: 500;
	letter-spacing: 0.02em;
}
.w-badge__dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
}

.w-badge--gain   { background: var(--gain-soft); color: var(--wise-deep); }
.w-badge--gain .w-badge__dot { background: var(--gain); }

.w-badge--loss   { background: var(--loss-soft); color: #7c3a28; }
.w-badge--loss .w-badge__dot { background: var(--loss); }

.w-badge--warn   { background: var(--warn-soft); color: #6e5d27; }
.w-badge--warn .w-badge__dot { background: var(--warn); }

.w-badge--info   { background: var(--info-soft); color: #2a4a64; }
.w-badge--info .w-badge__dot { background: var(--info); }

.w-badge--neutral { background: var(--stone-100); color: var(--fg-2); }
.w-badge--neutral .w-badge__dot { background: var(--stone-400); }
</style>
