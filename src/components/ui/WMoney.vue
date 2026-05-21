<template>
	<span class="w-money" :class="toneClass" :style="moneyStyle">{{ display }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		value: number;
		currency?: string;
		signed?: boolean;
		tone?: "gain" | "loss" | "mute" | null;
		size?: number;
		weight?: number;
	}>(),
	{
		currency: "EUR",
		size: 15,
		weight: 500,
	},
);

const currencyFormatter = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "EUR",
});

// Computed
const isNeg = computed(() => props.value < 0);

const formatted = computed(() => currencyFormatter.format(props.value));

const sign = computed(() => {
	if (props.signed) {
		return isNeg.value ? "− " : "+ ";
	}

	return isNeg.value ? "− " : "";
});

const display = computed(() => `${sign.value}${formatted.value}`);

const toneClass = computed(() => (props.tone ? `w-money--${props.tone}` : ""));
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
.w-money--gain {
	color: var(--wise-deep);
}
.w-money--loss {
	color: var(--loss);
}
.w-money--mute {
	color: var(--fg-3);
}
</style>
