<template>
	<div class="w-segment" role="tablist" :aria-disabled="disabled || undefined">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { provide, toRef } from "vue";
import { SEGMENT_INJECTION_KEY, type SegmentValue } from "./segment";

const props = withDefaults(
	defineProps<{
		value?: SegmentValue;
		disabled?: boolean;
	}>(),
	{
		value: undefined,
		disabled: false,
	},
);

const emit = defineEmits<{
	"update:value": [value: SegmentValue];
}>();

// Single source of truth for every descendant (buttons today, views later).
provide(SEGMENT_INJECTION_KEY, {
	selected: toRef(props, "value"),
	disabled: toRef(props, "disabled"),
	select: (value) => {
		if (props.disabled || value === props.value) {
			return;
		}
		emit("update:value", value);
	},
});
</script>

<style scoped>
.w-segment {
	display: inline-flex;
	gap: 4px;
	padding: 4px;
	background: var(--stone-100);
	border-radius: 999px;
}
.w-segment[aria-disabled="true"] {
	opacity: 0.6;
}
</style>
