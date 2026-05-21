<template>
	<div class="w-input" :class="rootClasses">
		<label v-if="label" :for="inputId" class="w-input__label">
			<WEyebrow>{{ label }}</WEyebrow>
		</label>
		<div class="w-input__shell" :class="shellClasses">
			<component v-if="icon" :is="iconComponent" :size="iconSize" class="w-input__icon" />
			<span v-if="prefix" class="w-input__prefix">{{ prefix }}</span>
			<input
				:id="inputId"
				ref="inputRef"
				:type="type"
				:value="value"
				:placeholder="placeholder"
				:disabled="disabled"
				:readonly="readonly"
				:required="required"
				:autocomplete="autocomplete"
				:inputmode="inputmode"
				:name="name"
				class="w-input__field"
				v-bind="$attrs"
				@input="onInput"
				@focus="onFocus"
				@blur="onBlur"
			/>
			<span v-if="suffix" class="w-input__suffix">{{ suffix }}</span>
			<slot name="trailing" />
		</div>
		<span v-if="error" class="w-input__error">{{ error }}</span>
		<span v-else-if="hint" class="w-input__hint">{{ hint }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import * as icons from "lucide-vue-next";
import WEyebrow from "./WEyebrow.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		value?: string | number;
		type?: "text" | "email" | "password" | "number" | "search" | "tel" | "url";
		placeholder?: string;
		label?: string;
		hint?: string;
		error?: string;
		prefix?: string;
		suffix?: string;
		icon?: string;
		size?: "sm" | "md" | "lg";
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		autocomplete?: string;
		inputmode?: "none" | "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
		name?: string;
	}>(),
	{
		type: "text",
		size: "md",
	},
);

const emit = defineEmits<{
	"update:value": [value: string];
	focus: [e: FocusEvent];
	blur: [e: FocusEvent];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const focused = ref(false);
const inputId = useId();

const iconSize = computed(() => {
	if (props.size === "sm") return 14;
	if (props.size === "lg") return 18;
	return 16;
});

const rootClasses = computed(() => ({
	"w-input--disabled": props.disabled,
}));

const shellClasses = computed(() => [
	`w-input__shell--${props.size}`,
	{
		"w-input__shell--focus": focused.value,
		"w-input__shell--error": !!props.error,
		"w-input__shell--disabled": props.disabled,
	},
]);

const iconComponent = computed(() => {
	if (!props.icon) return null;
	const name = props.icon
		.split("-")
		.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
		.join("");
	return (icons as Record<string, unknown>)[name] ?? null;
});

function onInput(e: Event) {
	emit("update:value", (e.target as HTMLInputElement).value);
}

function onFocus(e: FocusEvent) {
	focused.value = true;
	emit("focus", e);
}

function onBlur(e: FocusEvent) {
	focused.value = false;
	emit("blur", e);
}

function focus() {
	inputRef.value?.focus();
}

function blur() {
	inputRef.value?.blur();
}

defineExpose({ focus, blur, el: inputRef });
</script>

<style scoped>
.w-input {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.w-input--disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* ---- Label ---- */
.w-input__label {
	cursor: pointer;
}
.w-input--disabled .w-input__label {
	cursor: not-allowed;
}

/* ---- Shell (the bordered box) ---- */
.w-input__shell {
	display: flex;
	align-items: center;
	gap: 8px;
	background: var(--paper);
	border: 1px solid var(--line);
	border-radius: 8px;
	transition:
		border-color 120ms var(--ease-out),
		box-shadow 120ms var(--ease-out);
}

.w-input__shell--sm {
	padding: 8px 10px;
}
.w-input__shell--md {
	padding: 10px 12px;
}
.w-input__shell--lg {
	padding: 14px 16px;
}

.w-input__shell--focus {
	border-color: var(--wise);
	box-shadow: 0 0 0 3px var(--wise-mist);
}

.w-input__shell--error {
	border-color: var(--loss);
}
.w-input__shell--error.w-input__shell--focus {
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--loss) 12%, transparent);
}

.w-input__shell--disabled {
	pointer-events: none;
}

/* ---- Icon / prefix / suffix ---- */
.w-input__icon {
	color: var(--fg-4);
	flex-shrink: 0;
}

.w-input__prefix,
.w-input__suffix {
	color: var(--fg-4);
	font-size: 14px;
	flex-shrink: 0;
	user-select: none;
}

/* ---- Native input ---- */
.w-input__field {
	flex: 1;
	border: 0;
	outline: none;
	background: transparent;
	font-family: var(--font-sans);
	color: var(--ink);
	min-width: 0;
}

.w-input__shell--sm .w-input__field {
	font-size: 13px;
}
.w-input__shell--md .w-input__field {
	font-size: 14px;
}
.w-input__shell--lg .w-input__field {
	font-size: 15px;
}

.w-input__field::placeholder {
	color: var(--fg-4);
}

/* ---- Hint / error ---- */
.w-input__hint {
	font-size: 12px;
	color: var(--fg-4);
}

.w-input__error {
	font-size: 12px;
	color: var(--loss);
}
</style>
