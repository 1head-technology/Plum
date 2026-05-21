<template>
	<div class="w-bar" :style="{ height: `${height}px` }">
		<div class="w-bar__fill" :style="fillStyle" />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		value: number;
		max?: number;
		tone?: "accent" | "warn" | "loss";
		height?: number;
	}>(),
	{
		max: 100,
		tone: "accent",
		height: 6,
	},
);

const pct = computed(() => Math.min(100, (props.value / props.max) * 100));
const color = computed(() => {
	if (props.tone === "warn") {
		return "var(--warn)";
	}
	if (props.tone === "loss") {
		return "var(--loss)";
	}
	return "var(--wise)";
});
const fillStyle = computed(() => ({
	width: `${pct.value}%`,
	background: color.value,
}));
</script>

<style scoped>
.w-bar {
	border-radius: 999px;
	background: var(--stone-100);
	overflow: hidden;
}
.w-bar__fill {
	height: 100%;
	border-radius: 999px;
	transition: width 420ms var(--ease-out);
}
</style>
