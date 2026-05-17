<template>
	<div class="donut" :style="{ width: `${size}px`, height: `${size}px` }">
		<svg :width="size" :height="size" style="transform: rotate(-90deg)">
			<circle :cx="size / 2" :cy="size / 2" :r="r" stroke="var(--stone-100)" :stroke-width="stroke" fill="none" />
			<circle :cx="size / 2" :cy="size / 2" :r="r" stroke="var(--wise)" :stroke-width="stroke" fill="none"
				:stroke-dasharray="c" :stroke-dashoffset="offset" stroke-linecap="round"
				style="transition: stroke-dashoffset 420ms var(--ease-out)" />
		</svg>
		<div class="donut__label">
			<div class="donut__value">{{ Math.round(value) }}%</div>
			<div class="donut__caption">spent</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
	value: number;
	size?: number;
	stroke?: number;
}>(), {
	size: 152,
	stroke: 14,
});

const r = computed(() => (props.size - props.stroke) / 2);
const c = computed(() => 2 * Math.PI * r.value);
const offset = computed(() => c.value - (Math.min(props.value, 100) / 100) * c.value);
</script>

<style scoped>
.donut {
	position: relative;
	flex-shrink: 0;
}
.donut__label {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.donut__value {
	font-size: 26px;
	font-weight: 500;
	font-variant-numeric: tabular-nums;
	letter-spacing: -0.02em;
	color: var(--ink);
}
.donut__caption {
	font-size: 10px;
	color: var(--fg-4);
	letter-spacing: 0.18em;
	text-transform: uppercase;
	margin-top: 2px;
}
</style>
