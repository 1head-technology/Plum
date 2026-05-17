<template>
	<div class="w-input" :class="{ 'w-input--focus': focused }">
		<component v-if="icon" :is="iconComponent" :size="16" class="w-input__icon" />
		<span v-if="prefix" class="w-input__prefix">{{ prefix }}</span>
		<input
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			class="w-input__field"
			@input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
			@focus="focused = true"
			@blur="focused = false"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import * as icons from "lucide-vue-next";

const props = withDefaults(defineProps<{
	modelValue?: string;
	placeholder?: string;
	prefix?: string;
	icon?: string;
	type?: string;
}>(), {
	type: "text",
});

defineEmits<{ "update:modelValue": [value: string] }>();

const focused = ref(false);

const iconComponent = computed(() => {
	if (!props.icon) return null;
	const name = props.icon
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
	return (icons as Record<string, unknown>)[name] ?? null;
});
</script>

<style scoped>
.w-input {
	display: flex;
	align-items: center;
	gap: 8px;
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 6px;
	padding: 10px 12px;
	transition: all 120ms var(--ease-out);
}
.w-input--focus {
	border-color: var(--wise);
	box-shadow: 0 0 0 3px var(--wise-mist);
}
.w-input__icon { color: var(--fg-4); }
.w-input__prefix { color: var(--fg-4); font-size: 14px; }
.w-input__field {
	flex: 1;
	border: 0;
	outline: none;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 14px;
	color: var(--ink);
	min-width: 0;
}
</style>
