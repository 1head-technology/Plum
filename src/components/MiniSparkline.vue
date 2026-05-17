<template>
	<svg :viewBox="`0 0 ${W} ${H}`" width="100%" :height="H" preserveAspectRatio="none" style="display: block">
		<path :d="fillPath" fill="var(--wise-mist)" opacity="0.6" />
		<path :d="linePath" fill="none" stroke="var(--wise)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
	</svg>
</template>

<script setup lang="ts">
import { computed } from "vue";

const pts = [38, 42, 40, 44, 46, 45, 48, 47, 50, 49, 52, 54];
const W = 480;
const H = 56;

const linePath = computed(() => {
	const max = Math.max(...pts);
	const min = Math.min(...pts);
	return pts
		.map((v, i) => {
			const x = (i / (pts.length - 1)) * W;
			const y = H - ((v - min) / (max - min)) * (H - 4) - 2;
			return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
		})
		.join(" ");
});

const fillPath = computed(() => `${linePath.value} L${W},${H} L0,${H} Z`);
</script>
