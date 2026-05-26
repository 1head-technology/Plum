<template>
	<div
		ref="rootRef"
		class="w-select"
		:class="rootClasses"
	>
		<label v-if="label" :id="labelId" class="w-select__label">
			<WEyebrow>{{ label }}</WEyebrow>
		</label>

		<button
			ref="triggerRef"
			type="button"
			class="w-select__trigger"
			:class="triggerClasses"
			:disabled="disabled"
			:aria-labelledby="label ? labelId : undefined"
			:aria-expanded="isOpen"
			aria-haspopup="listbox"
			@click="toggle"
			@keydown="onTriggerKeydown"
		>
			<component v-if="icon" :is="iconComponent" :size="iconSize" class="w-select__icon" />

			<span v-if="hasSelection" class="w-select__value">
				{{ displayValue }}
			</span>
			<span v-else class="w-select__placeholder">
				{{ placeholder }}
			</span>

			<ChevronDown :size="iconSize" class="w-select__chevron" :class="{ 'w-select__chevron--open': isOpen }" />
		</button>

		<Teleport to="body">
			<Transition name="w-select-drop">
				<div
					v-if="isOpen"
					ref="dropdownRef"
					class="w-select__dropdown"
					:class="`w-select__dropdown--${size}`"
					:style="floatingStyles"
					role="listbox"
					:aria-labelledby="label ? labelId : undefined"
					@keydown="onListKeydown"
				>
					<div v-if="searchable" class="w-select__search-wrap">
						<Search :size="14" class="w-select__search-icon" />
						<input
							ref="searchInputRef"
							v-model="searchQuery"
							type="text"
							class="w-select__search"
							placeholder="Search…"
							@keydown.stop="onSearchKeydown"
						/>
					</div>

					<div class="w-select__list" ref="listRef">
						<template v-if="filteredOptions.length">
							<button
								v-for="(opt, i) in filteredOptions"
								:key="optionValue(opt)"
								type="button"
								class="w-select__option"
								:class="{
									'w-select__option--selected': isSelected(opt),
									'w-select__option--highlighted': highlightedIndex === i,
								}"
								role="option"
								:aria-selected="isSelected(opt)"
								@click="select(opt)"
								@mouseenter="highlightedIndex = i"
							>
								<span class="w-select__option-label">{{ optionLabel(opt) }}</span>
								<span v-if="optionDescription(opt)" class="w-select__option-desc">{{ optionDescription(opt) }}</span>
								<Check v-if="isSelected(opt)" :size="14" class="w-select__check" />
							</button>
						</template>
						<div v-else class="w-select__empty">No results</div>
					</div>
				</div>
			</Transition>
		</Teleport>

		<span v-if="error" class="w-select__error">{{ error }}</span>
		<span v-else-if="hint" class="w-select__hint">{{ hint }}</span>
	</div>
</template>

<script setup lang="ts">
import {
	computed,
	nextTick,
	onBeforeUnmount,
	ref,
	useId,
	watch,
	type CSSProperties,
} from "vue";
import { Check, ChevronDown, Search } from "lucide-vue-next";
import * as icons from "lucide-vue-next";
import WEyebrow from "./WEyebrow.vue";

/**
 * A single option can be:
 *  - a plain string  →  value & label are the same
 *  - an object       →  keyed by `valueKey` / `labelKey` / `descriptionKey`
 */
export type SelectOption = string | Record<string, unknown>;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
	defineProps<{
		value?: string | number | null;
		options: SelectOption[];
		placeholder?: string;
		label?: string;
		hint?: string;
		error?: string;
		icon?: string;
		size?: "sm" | "md" | "lg";
		disabled?: boolean;
		required?: boolean;
		searchable?: boolean;
		name?: string;
		/** Object key used as the option value (default: "value") */
		valueKey?: string;
		/** Object key used as the option display label (default: "label") */
		labelKey?: string;
		/** Object key used as an optional description line (default: "description") */
		descriptionKey?: string;
	}>(),
	{
		placeholder: "Select…",
		size: "md",
		valueKey: "value",
		labelKey: "label",
		descriptionKey: "description",
	},
);

const emit = defineEmits<{
	"update:value": [value: string | number | null];
	change: [value: string | number | null];
}>();

// ---- Refs ----
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const listRef = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const searchQuery = ref("");
const highlightedIndex = ref(-1);
const floatingStyles = ref<CSSProperties>({});

const labelId = useId();

// ---- Option helpers ----
function optionValue(opt: SelectOption): string | number {
	if (typeof opt === "string") return opt;
	return (opt[props.valueKey] as string | number) ?? "";
}

function optionLabel(opt: SelectOption): string {
	if (typeof opt === "string") return opt;
	return String((opt[props.labelKey] as string) ?? (opt[props.valueKey] as string) ?? "");
}

function optionDescription(opt: SelectOption): string | undefined {
	if (typeof opt === "string") return undefined;
	const desc = opt[props.descriptionKey];
	return desc != null ? String(desc) : undefined;
}

function isSelected(opt: SelectOption) {
	return optionValue(opt) === props.value;
}

// ---- Computed ----
const hasSelection = computed(() => props.value != null && props.value !== "");

const displayValue = computed(() => {
	if (!hasSelection.value) return "";
	const found = props.options.find((o) => optionValue(o) === props.value);
	return found ? optionLabel(found) : String(props.value);
});

const filteredOptions = computed(() => {
	if (!searchQuery.value) return props.options;
	const q = searchQuery.value.toLowerCase();
	return props.options.filter((opt) => {
		const label = optionLabel(opt).toLowerCase();
		const desc = optionDescription(opt)?.toLowerCase() ?? "";
		return label.includes(q) || desc.includes(q);
	});
});

const iconSize = computed(() => {
	if (props.size === "sm") return 14;
	if (props.size === "lg") return 18;
	return 16;
});

const rootClasses = computed(() => ({
	"w-select--disabled": props.disabled,
}));

const triggerClasses = computed(() => [
	`w-select__trigger--${props.size}`,
	{
		"w-select__trigger--open": isOpen.value,
		"w-select__trigger--error": !!props.error,
		"w-select__trigger--disabled": props.disabled,
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

// ---- Positioning ----
function updatePosition() {
	if (!triggerRef.value || !dropdownRef.value) return;

	const rect = triggerRef.value.getBoundingClientRect();
	const dropH = dropdownRef.value.offsetHeight;
	const spaceBelow = window.innerHeight - rect.bottom - 8;
	const placeAbove = spaceBelow < dropH && rect.top > spaceBelow;

	floatingStyles.value = {
		position: "fixed",
		left: `${rect.left}px`,
		width: `${rect.width}px`,
		zIndex: 1200,
		...(placeAbove
			? { bottom: `${window.innerHeight - rect.top + 4}px` }
			: { top: `${rect.bottom + 4}px` }),
	};
}

// ---- Open / close ----
function open() {
	if (props.disabled) return;
	isOpen.value = true;
	searchQuery.value = "";
	highlightedIndex.value = -1;

	nextTick(() => {
		updatePosition();
		if (props.searchable) {
			searchInputRef.value?.focus();
		}
		// Scroll selected option into view
		scrollToSelected();
	});
}

function close() {
	isOpen.value = false;
	triggerRef.value?.focus();
}

function toggle() {
	if (isOpen.value) close();
	else open();
}

function select(opt: SelectOption) {
	const val = optionValue(opt);
	emit("update:value", val);
	emit("change", val);
	close();
}

// ---- Scroll helpers ----
function scrollToSelected() {
	if (!listRef.value) return;
	const selectedEl = listRef.value.querySelector(".w-select__option--selected");
	selectedEl?.scrollIntoView({ block: "nearest" });
}

function scrollHighlightedIntoView() {
	if (!listRef.value) return;
	const items = listRef.value.querySelectorAll(".w-select__option");
	items[highlightedIndex.value]?.scrollIntoView({ block: "nearest" });
}

// ---- Keyboard ----
function onTriggerKeydown(e: KeyboardEvent) {
	switch (e.key) {
		case "Enter":
		case " ":
		case "ArrowDown":
		case "ArrowUp":
			e.preventDefault();
			if (!isOpen.value) open();
			break;
		case "Escape":
			if (isOpen.value) {
				e.preventDefault();
				close();
			}
			break;
	}
}

function navigateList(e: KeyboardEvent) {
	const len = filteredOptions.value.length;
	if (!len) return;

	switch (e.key) {
		case "ArrowDown":
			e.preventDefault();
			highlightedIndex.value = (highlightedIndex.value + 1) % len;
			scrollHighlightedIntoView();
			break;
		case "ArrowUp":
			e.preventDefault();
			highlightedIndex.value = (highlightedIndex.value - 1 + len) % len;
			scrollHighlightedIntoView();
			break;
		case "Home":
			e.preventDefault();
			highlightedIndex.value = 0;
			scrollHighlightedIntoView();
			break;
		case "End":
			e.preventDefault();
			highlightedIndex.value = len - 1;
			scrollHighlightedIntoView();
			break;
		case "Enter":
			e.preventDefault();
			if (highlightedIndex.value >= 0) {
				select(filteredOptions.value[highlightedIndex.value] as SelectOption);
			}
			break;
		case "Escape":
			e.preventDefault();
			close();
			break;
		case "Tab":
			close();
			break;
	}
}

function onListKeydown(e: KeyboardEvent) {
	navigateList(e);
}

function onSearchKeydown(e: KeyboardEvent) {
	navigateList(e);
}

// ---- Click-outside ----
function onClickOutside(e: MouseEvent) {
	if (!isOpen.value) return;
	const target = e.target as Node;
	if (
		rootRef.value?.contains(target) ||
		dropdownRef.value?.contains(target)
	) return;
	close();
}

watch(isOpen, (open) => {
	if (open) {
		document.addEventListener("mousedown", onClickOutside, true);
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);
	} else {
		document.removeEventListener("mousedown", onClickOutside, true);
		window.removeEventListener("resize", updatePosition);
		window.removeEventListener("scroll", updatePosition, true);
	}
});

// Reset highlight when search changes
watch(searchQuery, () => {
	highlightedIndex.value = filteredOptions.value.length ? 0 : -1;
});

onBeforeUnmount(() => {
	document.removeEventListener("mousedown", onClickOutside, true);
	window.removeEventListener("resize", updatePosition);
	window.removeEventListener("scroll", updatePosition, true);
});

defineExpose({ open, close, toggle });
</script>

<style scoped>
.w-select {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.w-select--disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* ---- Label ---- */
.w-select__label {
	cursor: pointer;
}
.w-select--disabled .w-select__label {
	cursor: not-allowed;
}

/* ---- Trigger (the button that looks like an input) ---- */
.w-select__trigger {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	background: var(--paper);
	border: 1px solid var(--line);
	border-radius: 8px;
	font-family: var(--font-sans);
	color: var(--ink);
	cursor: pointer;
	text-align: left;
	transition:
		border-color 120ms var(--ease-out),
		box-shadow 120ms var(--ease-out);
}

.w-select__trigger--sm {
	padding: 8px 10px;
	font-size: 13px;
}
.w-select__trigger--md {
	padding: 10px 12px;
	font-size: 14px;
}
.w-select__trigger--lg {
	padding: 14px 16px;
	font-size: 15px;
}

.w-select__trigger--open,
.w-select__trigger:focus-visible {
	border-color: var(--wise);
	box-shadow: 0 0 0 3px var(--wise-mist);
	outline: none;
}

.w-select__trigger--error {
	border-color: var(--loss);
}
.w-select__trigger--error.w-select__trigger--open,
.w-select__trigger--error:focus-visible {
	box-shadow: 0 0 0 3px color-mix(in srgb, var(--loss) 12%, transparent);
}

.w-select__trigger--disabled {
	pointer-events: none;
}

/* ---- Icon ---- */
.w-select__icon {
	color: var(--fg-4);
	flex-shrink: 0;
}

/* ---- Value / placeholder ---- */
.w-select__value {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.w-select__placeholder {
	flex: 1;
	color: var(--fg-4);
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* ---- Chevron ---- */
.w-select__chevron {
	color: var(--fg-4);
	flex-shrink: 0;
	transition: transform 160ms var(--ease-out);
}
.w-select__chevron--open {
	transform: rotate(180deg);
}

/* ---- Dropdown ---- */
.w-select__dropdown {
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 10px;
	box-shadow:
		0 12px 36px rgba(0, 0, 0, 0.12),
		0 4px 12px rgba(0, 0, 0, 0.06);
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

/* ---- Search ---- */
.w-select__search-wrap {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 12px;
	border-bottom: 1px solid var(--line);
}

.w-select__search-icon {
	color: var(--fg-4);
	flex-shrink: 0;
}

.w-select__search {
	flex: 1;
	border: 0;
	outline: none;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 13px;
	color: var(--ink);
	min-width: 0;
}
.w-select__search::placeholder {
	color: var(--fg-4);
}

/* ---- List ---- */
.w-select__list {
	overflow-y: auto;
	padding: 4px;
}

.w-select__dropdown--sm .w-select__list { max-height: 160px; }
.w-select__dropdown--md .w-select__list { max-height: 220px; }
.w-select__dropdown--lg .w-select__list { max-height: 300px; }

/* ---- Option ---- */
.w-select__option {
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	padding: 8px 10px;
	border: none;
	border-radius: 6px;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 13px;
	color: var(--fg-1);
	text-align: left;
	cursor: pointer;
	transition: background 80ms var(--ease-out);
}

.w-select__option--highlighted {
	background: var(--stone-100);
}

.w-select__option--selected {
	color: var(--ink);
	font-weight: 500;
}

.w-select__option-label {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.w-select__option-desc {
	font-size: 12px;
	color: var(--fg-4);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 140px;
}

.w-select__check {
	color: var(--wise);
	flex-shrink: 0;
}

/* ---- Empty ---- */
.w-select__empty {
	padding: 16px 12px;
	text-align: center;
	font-size: 13px;
	color: var(--fg-4);
}

/* ---- Hint / error ---- */
.w-select__hint {
	font-size: 12px;
	color: var(--fg-4);
}

.w-select__error {
	font-size: 12px;
	color: var(--loss);
}

/* ---- Transition ---- */
.w-select-drop-enter-active {
	transition: opacity 120ms var(--ease-out), transform 120ms var(--ease-out);
}
.w-select-drop-leave-active {
	transition: opacity 80ms ease-in, transform 80ms ease-in;
}
.w-select-drop-enter-from,
.w-select-drop-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
