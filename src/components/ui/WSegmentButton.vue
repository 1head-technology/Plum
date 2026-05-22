<template>
	<button
		type="button"
		role="tab"
		class="w-segment-button"
		:class="modifiers"
		:aria-selected="isActive"
		:disabled="isDisabled"
		@click="onClick"
	>
		<slot>{{ label }}</slot>
	</button>
</template>

<script setup lang="ts">
import { computed, inject, toRef } from "vue";
import { SEGMENT_INJECTION_KEY, type SegmentValue } from "./segment";

// Props
const props = withDefaults(
	defineProps<{
		value: SegmentValue;
		label?: string;
		disabled?: boolean;
		color?: "light" | "dark" | "accent";
	}>(),
	{
		color: "light",
	},
);

const value = toRef(props, "value");
const label = toRef(props, "label");
const disabled = toRef(props, "disabled");
const color = toRef(props, "color");

// `null` default keeps the button usable (and warns) if rendered outside a <WSegment>.
const segment = inject(SEGMENT_INJECTION_KEY, null);

if (!segment && import.meta.env.DEV) {
	console.warn("[WSegmentButton] must be used inside a <WSegment>.");
}

const isActive = computed(() => segment?.selected.value === value.value);
const isDisabled = computed(() => disabled.value || segment?.disabled.value || false);

const modifiers = computed(() => ({
	"w-segment-button--active": isActive.value,
	"w-segment-button--light": color.value === "light",
	"w-segment-button--dark": color.value === "dark",
	"w-segment-button--accent": color.value === "accent",
}));

// Functions
function onClick() {
	if (isDisabled.value) {
		return;
	}
	segment?.select(props.value);
}
</script>

<style scoped>
.w-segment-button {
	padding: 8px 20px;

	border: none;
	border-radius: 4444px;

	background: transparent;

	color: var(--fg-3);
	font-size: 13px;
	font-weight: 500;
	font-family: var(--font-sans);

	cursor: pointer;

	transition: all 155ms var(--ease-out);
}

.w-segment-button--active {
	&.w-segment-button--light {
		background: var(--paper-warm);
		color: var(--ink);
	}
	&.w-segment-button--dark {
		background: var(--ink);
		color: var(--paper);
	}
	&.w-segment-button--accent {
		background: var(--wise);
		color: var(--paper);
	}
}
.w-segment-button:disabled {
	cursor: not-allowed;
	opacity: 0.5;
}
</style>
