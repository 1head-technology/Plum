<template>
	<button
		:type="type"
		:disabled="disabled"
		class="w-btn"
		:class="[`w-btn--${variant}`, `w-btn--${size}`, { 'w-btn--disabled': disabled }]"
		@click="!disabled && $emit('click', $event)"
	>
		<component v-if="icon" :is="iconComponent" :size="size === 'sm' ? 14 : 16" />
		<slot />
	</button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import * as icons from "lucide-vue-next";

const props = withDefaults(
	defineProps<{
		variant?: "primary" | "ghost" | "dark" | "text" | "accent";
		size?: "sm" | "md" | "lg";
		icon?: string;
		type?: "button" | "submit" | "reset";
		disabled?: boolean;
	}>(),
	{
		variant: "ghost",
		size: "md",
		type: "button",
	},
);

defineEmits<{ click: [e: MouseEvent] }>();

const iconComponent = computed(() => {
	if (!props.icon) {
		return null;
	}
	const name = props.icon
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");

	return (icons as Record<string, unknown>)[name] ?? null;
});
</script>

<style scoped>
.w-btn {
	font-family: var(--font-sans);
	font-weight: 500;
	border: 1px solid transparent;
	border-radius: 8px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 8px;
	transition:
		background 120ms var(--ease-out),
		color 120ms var(--ease-out),
		opacity 120ms;
	letter-spacing: 0;
}

.w-btn--disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.w-btn--sm {
	padding: 7px 12px;
	font-size: 12px;
}
.w-btn--md {
	padding: 10px 16px;
	font-size: 13px;
}
.w-btn--lg {
	padding: 13px 22px;
	font-size: 14px;
}

.w-btn--primary {
	background: var(--wise);
	color: var(--paper-warm);
}
.w-btn--primary:hover:not(:disabled) {
	background: var(--wise-deep);
}

.w-btn--ghost {
	background: transparent;
	color: var(--ink);
	border-color: var(--line);
}
.w-btn--ghost:hover:not(:disabled) {
	background: var(--stone-100);
}

.w-btn--dark {
	background: var(--ink);
	color: var(--paper-warm);
}
.w-btn--dark:hover:not(:disabled) {
	background: var(--stone-700);
}

.w-btn--text {
	background: transparent;
	color: var(--ink);
	padding: 6px 4px;
	border: none;
}
.w-btn--text:hover:not(:disabled) {
	opacity: 0.65;
}

.w-btn--accent {
	background: var(--wise-paper);
	color: var(--wise-deep);
}
.w-btn--accent:hover:not(:disabled) {
	background: var(--wise-mist);
}
</style>
