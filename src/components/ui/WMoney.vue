<template>
	<span class="w-money" :class="toneClass" :style="moneyStyle">{{ display }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
	value: number;
	currency?: string;
	signed?: boolean;
	tone?: "gain" | "loss" | "mute" | null;
	size?: number;
	weight?: number;
}>(), {
	currency: "$",
	size: 15,
	weight: 500,
});

const isNeg = computed(() => props.value < 0);
const formatted = computed(() =>
	Math.abs(props.value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
);
const sign = computed(() => {
	if (props.signed) return isNeg.value ? "− " : "+ ";
	return isNeg.value ? "− " : "";
});
const display = computed(() => `${sign.value}${props.currency}${formatted.value}`);

const toneClass = computed(() => props.tone ? `w-money--${props.tone}` : "");
const moneyStyle = computed(() => ({
	fontSize: `${props.size}px`,
	fontWeight: props.weight,
}));
</script>

<style scoped>
.w-money {
	font-family: var(--font-sans);
	font-variant-numeric: tabular-nums lining-nums;
	letter-spacing: -0.01em;
	color: var(--ink);
}
.w-money--gain { color: var(--wise-deep); }
.w-money--loss { color: var(--loss); }
.w-money--mute { color: var(--fg-3); }
</style>
