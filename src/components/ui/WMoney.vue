<template>
	<span class="w-money" :class="toneClass" :style="moneyStyle">{{ display }}</span>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";

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

const value = toRef(props, "value");
const currency = toRef(props, "currency");
const signed = toRef(props, "signed");
const tone = toRef(props, "tone");
const size = toRef(props, "size");
const weight = toRef(props, "weight");

// Computed
const isNeg = computed(() => value.value < 0);

const currencyFormatter = computed(() =>
	new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: currency.value,
	}),
);

const formatted = computed(() => currencyFormatter.value.format(value.value));

const sign = computed(() => {
	if (signed.value) {
		return isNeg.value ? "− " : "+ ";
	}

	return isNeg.value ? "− " : "";
});

const display = computed(() => `${sign.value}${formatted.value}`);

const toneClass = computed(() => (tone.value ? `w-money--${tone.value}` : ""));

const moneyStyle = computed(() => ({
	fontSize: `${size.value}px`,
	fontWeight: weight.value,
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
