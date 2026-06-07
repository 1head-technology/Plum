<template>
	<div ref="rootRef" class="w-date" :class="{ 'w-date--disabled': disabled }">
		<label v-if="label" :id="labelId" class="w-date__label">
			<WEyebrow>{{ label }}</WEyebrow>
		</label>

		<button
			ref="triggerRef"
			type="button"
			class="w-date__trigger"
			:class="triggerClasses"
			:disabled="disabled"
			:aria-labelledby="label ? labelId : undefined"
			:aria-expanded="isOpen"
			aria-haspopup="dialog"
			@click="toggle"
			@keydown="onTriggerKeydown"
		>
			<Calendar :size="iconSize" class="w-date__icon" />

			<span v-if="hasSelection" class="w-date__value">{{ displayValue }}</span>
			<span v-else class="w-date__placeholder">{{ placeholder }}</span>

			<button
				v-if="hasSelection && clearable && !disabled"
				type="button"
				class="w-date__clear"
				aria-label="Clear date"
				@click.stop="clear"
			>
				<X :size="iconSize - 2" />
			</button>
		</button>

		<Teleport to="body">
			<Transition name="w-date-drop">
				<div
					v-if="isOpen"
					ref="popoverRef"
					class="w-date__popover"
					:style="floatingStyles"
					role="dialog"
					:aria-label="label || 'Choose date'"
					@keydown="onPopoverKeydown"
				>
					<!-- Header: prev | title | next -->
					<div class="w-date__header">
						<button
							type="button"
							class="w-date__nav"
							:aria-label="prevLabel"
							:disabled="prevDisabled"
							@click="goPrev"
						>
							<ChevronLeft :size="16" />
						</button>

						<button type="button" class="w-date__title" @click="cycleView">
							{{ headerTitle }}
						</button>

						<button
							type="button"
							class="w-date__nav"
							:aria-label="nextLabel"
							:disabled="nextDisabled"
							@click="goNext"
						>
							<ChevronRight :size="16" />
						</button>
					</div>

					<!-- DAYS VIEW -->
					<div v-if="view === 'days'" class="w-date__days">
						<div class="w-date__weekdays">
							<span v-for="wd in weekdayLabels" :key="wd" class="w-date__weekday">{{ wd }}</span>
						</div>
						<div class="w-date__grid">
							<button
								v-for="cell in dayCells"
								:key="cell.iso"
								type="button"
								class="w-date__day"
								:class="{
									'w-date__day--outside': !cell.inMonth,
									'w-date__day--today': cell.isToday,
									'w-date__day--selected': cell.isSelected,
									'w-date__day--focused': cell.iso === focusedIso,
								}"
								:disabled="cell.disabled"
								:tabindex="cell.iso === focusedIso ? 0 : -1"
								:aria-selected="cell.isSelected"
								:aria-current="cell.isToday ? 'date' : undefined"
								@click="selectDay(cell.date)"
							>
								{{ cell.day }}
							</button>
						</div>
					</div>

					<!-- MONTHS VIEW -->
					<div v-else-if="view === 'months'" class="w-date__months">
						<button
							v-for="(m, i) in monthLabels"
							:key="m"
							type="button"
							class="w-date__month"
							:class="{
								'w-date__month--selected': isSelectedMonth(i),
								'w-date__month--current': isCurrentMonth(i),
							}"
							:disabled="isMonthDisabled(i)"
							@click="selectMonth(i)"
						>
							{{ m }}
						</button>
					</div>

					<!-- YEARS VIEW -->
					<div v-else class="w-date__years">
						<button
							v-for="y in yearCells"
							:key="y"
							type="button"
							class="w-date__year"
							:class="{
								'w-date__year--selected': isSelectedYear(y),
								'w-date__year--current': y === todayParts.year,
							}"
							:disabled="isYearDisabled(y)"
							@click="selectYear(y)"
						>
							{{ y }}
						</button>
					</div>

					<!-- Footer shortcuts -->
					<div v-if="showFooter" class="w-date__footer">
						<button
							v-if="showToday"
							type="button"
							class="w-date__shortcut"
							:disabled="todayDisabled"
							@click="goToday"
						>
							Today
						</button>
						<button
							v-if="hasSelection && clearable"
							type="button"
							class="w-date__shortcut w-date__shortcut--muted"
							@click="clear"
						>
							Clear
						</button>
					</div>
				</div>
			</Transition>
		</Teleport>

		<span v-if="error" class="w-date__error">{{ error }}</span>
		<span v-else-if="hint" class="w-date__hint">{{ hint }}</span>
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
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-vue-next";
import WEyebrow from "./WEyebrow.vue";

type CalendarView = "days" | "months" | "years";

const props = withDefaults(
	defineProps<{
		/** Selected date as an ISO `YYYY-MM-DD` string (or null). Use with `v-model:value`. */
		value?: string | null;
		label?: string;
		placeholder?: string;
		hint?: string;
		error?: string;
		size?: "sm" | "md" | "lg";
		disabled?: boolean;
		clearable?: boolean;
		/** Earliest selectable date (ISO `YYYY-MM-DD`). */
		min?: string | null;
		/** Latest selectable date (ISO `YYYY-MM-DD`). */
		max?: string | null;
		/** 0 = Sunday, 1 = Monday … (default 1). */
		firstDayOfWeek?: number;
		/** BCP-47 locale for month/weekday names & display formatting. */
		locale?: string;
		/** Show the "Today" shortcut in the footer. */
		showToday?: boolean;
	}>(),
	{
		value: null,
		placeholder: "Select date…",
		size: "md",
		clearable: true,
		min: null,
		max: null,
		firstDayOfWeek: 1,
		locale: "en-US",
		showToday: true,
	},
);

const emit = defineEmits<{
	"update:value": [value: string | null];
	change: [value: string | null];
}>();

// ---------------------------------------------------------------- date utils
function pad(n: number) {
	return String(n).padStart(2, "0");
}

/** Local-time ISO date (YYYY-MM-DD) — avoids UTC off-by-one from toISOString(). */
function toISO(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromISO(s: string | null | undefined): Date | null {
	if (!s) return null;
	const [y, m, d] = s.split("-").map(Number);
	if (!y || !m || !d) return null;
	return new Date(y, m - 1, d);
}

function startOfDay(d: Date): Date {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function clampToBounds(d: Date): Date {
	const minD = fromISO(props.min);
	const maxD = fromISO(props.max);
	if (minD && d < minD) return minD;
	if (maxD && d > maxD) return maxD;
	return d;
}

function isDisabledDate(d: Date): boolean {
	const minD = fromISO(props.min);
	const maxD = fromISO(props.max);
	if (minD && startOfDay(d) < startOfDay(minD)) return true;
	if (maxD && startOfDay(d) > startOfDay(maxD)) return true;
	return false;
}

// ---------------------------------------------------------------- refs/state
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const popoverRef = ref<HTMLElement | null>(null);

const isOpen = ref(false);
const view = ref<CalendarView>("days");
const floatingStyles = ref<CSSProperties>({});
const labelId = useId();

const today = new Date();
const todayParts = {
	year: today.getFullYear(),
	month: today.getMonth(),
};

// The month currently shown in the calendar (independent of selection).
const viewYear = ref(todayParts.year);
const viewMonth = ref(todayParts.month);

// The date with keyboard focus inside the grid.
const focusedIso = ref<string>(toISO(today));

const YEARS_PER_PAGE = 12;

// ---------------------------------------------------------------- selection
const selectedDate = computed(() => fromISO(props.value));
const hasSelection = computed(() => selectedDate.value != null);

const displayValue = computed(() => {
	const d = selectedDate.value;
	if (!d) return "";
	return new Intl.DateTimeFormat(props.locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(d);
});

// ---------------------------------------------------------------- locale names
const monthLabels = computed(() => {
	const fmt = new Intl.DateTimeFormat(props.locale, { month: "short" });
	return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
});

const monthLongLabels = computed(() => {
	const fmt = new Intl.DateTimeFormat(props.locale, { month: "long" });
	return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
});

const weekdayLabels = computed(() => {
	const fmt = new Intl.DateTimeFormat(props.locale, { weekday: "short" });
	// 2024-01-07 is a Sunday → build a week, then rotate to firstDayOfWeek.
	const base = Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
	const offset = ((props.firstDayOfWeek % 7) + 7) % 7;
	return [...base.slice(offset), ...base.slice(0, offset)];
});

// ---------------------------------------------------------------- header
const headerTitle = computed(() => {
	if (view.value === "days") {
		return `${monthLongLabels.value[viewMonth.value]} ${viewYear.value}`;
	}
	if (view.value === "months") {
		return String(viewYear.value);
	}
	const start = yearPageStart.value;
	return `${start} – ${start + YEARS_PER_PAGE - 1}`;
});

const prevLabel = computed(() =>
	view.value === "days" ? "Previous month" : view.value === "months" ? "Previous year" : "Previous years",
);
const nextLabel = computed(() =>
	view.value === "days" ? "Next month" : view.value === "months" ? "Next year" : "Next years",
);

// ---------------------------------------------------------------- day grid
interface DayCell {
	date: Date;
	iso: string;
	day: number;
	inMonth: boolean;
	isToday: boolean;
	isSelected: boolean;
	disabled: boolean;
}

const dayCells = computed<DayCell[]>(() => {
	const firstOfMonth = new Date(viewYear.value, viewMonth.value, 1);
	const offset = ((firstOfMonth.getDay() - props.firstDayOfWeek) % 7 + 7) % 7;
	const gridStart = new Date(viewYear.value, viewMonth.value, 1 - offset);

	const sel = selectedDate.value;

	return Array.from({ length: 42 }, (_, i) => {
		const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
		return {
			date,
			iso: toISO(date),
			day: date.getDate(),
			inMonth: date.getMonth() === viewMonth.value,
			isToday: isSameDay(date, today),
			isSelected: sel ? isSameDay(date, sel) : false,
			disabled: isDisabledDate(date),
		};
	});
});

// ---------------------------------------------------------------- year grid
const yearPageStart = computed(
	() => viewYear.value - ((viewYear.value % YEARS_PER_PAGE)),
);

const yearCells = computed(() =>
	Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart.value + i),
);

// ---------------------------------------------------------------- month/year disabled
function isMonthDisabled(monthIndex: number): boolean {
	// Disabled only if the entire month falls outside [min, max].
	const firstDay = new Date(viewYear.value, monthIndex, 1);
	const lastDay = new Date(viewYear.value, monthIndex + 1, 0);
	const minD = fromISO(props.min);
	const maxD = fromISO(props.max);
	if (maxD && firstDay > maxD) return true;
	if (minD && lastDay < minD) return true;
	return false;
}

function isYearDisabled(year: number): boolean {
	const firstDay = new Date(year, 0, 1);
	const lastDay = new Date(year, 11, 31);
	const minD = fromISO(props.min);
	const maxD = fromISO(props.max);
	if (maxD && firstDay > maxD) return true;
	if (minD && lastDay < minD) return true;
	return false;
}

function isSelectedMonth(monthIndex: number): boolean {
	const sel = selectedDate.value;
	return !!sel && sel.getFullYear() === viewYear.value && sel.getMonth() === monthIndex;
}
function isCurrentMonth(monthIndex: number): boolean {
	return viewYear.value === todayParts.year && monthIndex === todayParts.month;
}
function isSelectedYear(year: number): boolean {
	const sel = selectedDate.value;
	return !!sel && sel.getFullYear() === year;
}

// ---------------------------------------------------------------- nav buttons
const prevDisabled = computed(() => {
	const minD = fromISO(props.min);
	if (!minD) return false;
	if (view.value === "days") {
		return new Date(viewYear.value, viewMonth.value, 0) < startOfDay(minD);
	}
	if (view.value === "months") {
		return new Date(viewYear.value - 1, 11, 31) < startOfDay(minD);
	}
	return new Date(yearPageStart.value - 1, 11, 31) < startOfDay(minD);
});

const nextDisabled = computed(() => {
	const maxD = fromISO(props.max);
	if (!maxD) return false;
	if (view.value === "days") {
		return new Date(viewYear.value, viewMonth.value + 1, 1) > startOfDay(maxD);
	}
	if (view.value === "months") {
		return new Date(viewYear.value + 1, 0, 1) > startOfDay(maxD);
	}
	return new Date(yearPageStart.value + YEARS_PER_PAGE, 0, 1) > startOfDay(maxD);
});

const todayDisabled = computed(() => isDisabledDate(today));

const showFooter = computed(
	() => (props.showToday) || (hasSelection.value && props.clearable),
);

// ---------------------------------------------------------------- icon size
const iconSize = computed(() => (props.size === "sm" ? 14 : props.size === "lg" ? 18 : 16));

const triggerClasses = computed(() => [
	`w-date__trigger--${props.size}`,
	{
		"w-date__trigger--open": isOpen.value,
		"w-date__trigger--error": !!props.error,
	},
]);

// ---------------------------------------------------------------- navigation
function goPrev() {
	if (view.value === "days") shiftMonth(-1);
	else if (view.value === "months") viewYear.value -= 1;
	else viewYear.value -= YEARS_PER_PAGE;
}
function goNext() {
	if (view.value === "days") shiftMonth(1);
	else if (view.value === "months") viewYear.value += 1;
	else viewYear.value += YEARS_PER_PAGE;
}

function shiftMonth(delta: number) {
	const d = new Date(viewYear.value, viewMonth.value + delta, 1);
	viewYear.value = d.getFullYear();
	viewMonth.value = d.getMonth();
}

function cycleView() {
	view.value = view.value === "days" ? "months" : view.value === "months" ? "years" : "days";
}

// ---------------------------------------------------------------- selection actions
function commit(d: Date) {
	const iso = toISO(d);
	emit("update:value", iso);
	emit("change", iso);
	close();
}

function selectDay(d: Date) {
	if (isDisabledDate(d)) return;
	commit(d);
}

function selectMonth(monthIndex: number) {
	if (isMonthDisabled(monthIndex)) return;
	viewMonth.value = monthIndex;
	view.value = "days";
	syncFocusToView();
}

function selectYear(year: number) {
	if (isYearDisabled(year)) return;
	viewYear.value = year;
	view.value = "months";
}

function goToday() {
	if (todayDisabled.value) return;
	commit(today);
}

function clear() {
	emit("update:value", null);
	emit("change", null);
}

// ---------------------------------------------------------------- focus handling
function syncFocusToView() {
	// Keep the focused day inside the visible month.
	const f = fromISO(focusedIso.value);
	if (!f || f.getMonth() !== viewMonth.value || f.getFullYear() !== viewYear.value) {
		focusedIso.value = toISO(new Date(viewYear.value, viewMonth.value, 1));
	}
	focusGridCell();
}

function focusGridCell() {
	nextTick(() => {
		const el = popoverRef.value?.querySelector<HTMLElement>(".w-date__day--focused");
		el?.focus();
	});
}

function moveFocus(deltaDays: number) {
	const base = fromISO(focusedIso.value) ?? today;
	let next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + deltaDays);
	next = clampToBounds(next);
	focusedIso.value = toISO(next);
	if (next.getMonth() !== viewMonth.value || next.getFullYear() !== viewYear.value) {
		viewYear.value = next.getFullYear();
		viewMonth.value = next.getMonth();
	}
	focusGridCell();
}

// ---------------------------------------------------------------- open/close
function open() {
	if (props.disabled) return;
	isOpen.value = true;

	// Start the calendar on the selected month (or today) and focus it.
	const anchor = selectedDate.value ?? today;
	viewYear.value = anchor.getFullYear();
	viewMonth.value = anchor.getMonth();
	view.value = "days";
	focusedIso.value = toISO(clampToBounds(anchor));

	nextTick(() => {
		updatePosition();
		focusGridCell();
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

// ---------------------------------------------------------------- positioning
function updatePosition() {
	if (!triggerRef.value || !popoverRef.value) return;

	const rect = triggerRef.value.getBoundingClientRect();
	const popH = popoverRef.value.offsetHeight;
	const popW = popoverRef.value.offsetWidth;
	const spaceBelow = window.innerHeight - rect.bottom - 8;
	const placeAbove = spaceBelow < popH && rect.top > spaceBelow;

	// Keep the popover within the viewport horizontally.
	const left = Math.min(rect.left, window.innerWidth - popW - 8);

	floatingStyles.value = {
		position: "fixed",
		left: `${Math.max(8, left)}px`,
		zIndex: 1200,
		...(placeAbove
			? { bottom: `${window.innerHeight - rect.top + 4}px` }
			: { top: `${rect.bottom + 4}px` }),
	};
}

// ---------------------------------------------------------------- keyboard
function onTriggerKeydown(e: KeyboardEvent) {
	switch (e.key) {
		case "Enter":
		case " ":
		case "ArrowDown":
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

function onPopoverKeydown(e: KeyboardEvent) {
	if (e.key === "Escape") {
		e.preventDefault();
		close();
		return;
	}

	if (e.key === "Tab") {
		// Simple focus trap-ish: keep focus on the grid.
		return;
	}

	if (view.value !== "days") return;

	switch (e.key) {
		case "ArrowLeft":
			e.preventDefault();
			moveFocus(-1);
			break;
		case "ArrowRight":
			e.preventDefault();
			moveFocus(1);
			break;
		case "ArrowUp":
			e.preventDefault();
			moveFocus(-7);
			break;
		case "ArrowDown":
			e.preventDefault();
			moveFocus(7);
			break;
		case "Home":
			e.preventDefault();
			moveFocus(-(((fromISO(focusedIso.value)?.getDay() ?? 0) - props.firstDayOfWeek + 7) % 7));
			break;
		case "End":
			e.preventDefault();
			moveFocus(6 - (((fromISO(focusedIso.value)?.getDay() ?? 0) - props.firstDayOfWeek + 7) % 7));
			break;
		case "PageUp":
			e.preventDefault();
			shiftMonth(e.shiftKey ? -12 : -1);
			syncFocusToView();
			break;
		case "PageDown":
			e.preventDefault();
			shiftMonth(e.shiftKey ? 12 : 1);
			syncFocusToView();
			break;
		case "Enter":
		case " ": {
			e.preventDefault();
			const d = fromISO(focusedIso.value);
			if (d) selectDay(d);
			break;
		}
	}
}

// ---------------------------------------------------------------- click-outside
function onClickOutside(e: MouseEvent) {
	if (!isOpen.value) return;
	const target = e.target as Node;
	if (rootRef.value?.contains(target) || popoverRef.value?.contains(target)) return;
	close();
}

watch(isOpen, (openNow) => {
	if (openNow) {
		document.addEventListener("mousedown", onClickOutside, true);
		window.addEventListener("resize", updatePosition);
		window.addEventListener("scroll", updatePosition, true);
	} else {
		document.removeEventListener("mousedown", onClickOutside, true);
		window.removeEventListener("resize", updatePosition);
		window.removeEventListener("scroll", updatePosition, true);
	}
});

// Reposition when the view changes (months grid is a different height).
watch(view, () => {
	if (isOpen.value) nextTick(updatePosition);
});

onBeforeUnmount(() => {
	document.removeEventListener("mousedown", onClickOutside, true);
	window.removeEventListener("resize", updatePosition);
	window.removeEventListener("scroll", updatePosition, true);
});

defineExpose({ open, close, toggle });
</script>

<style scoped>
.w-date {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.w-date--disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
.w-date__label {
	cursor: pointer;
}

/* ---- Trigger ---- */
.w-date__trigger {
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
.w-date__trigger--sm { padding: 8px 10px; font-size: 13px; }
.w-date__trigger--md { padding: 10px 12px; font-size: 14px; }
.w-date__trigger--lg { padding: 14px 16px; font-size: 15px; }

.w-date__trigger--open,
.w-date__trigger:focus-visible {
	border-color: var(--wise);
	box-shadow: 0 0 0 3px var(--wise-mist);
	outline: none;
}
.w-date__trigger--error {
	border-color: var(--loss);
}

.w-date__icon {
	color: var(--fg-4);
	flex-shrink: 0;
}
.w-date__value {
	flex: 1;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.w-date__placeholder {
	flex: 1;
	color: var(--fg-4);
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.w-date__clear {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: 0;
	background: transparent;
	color: var(--fg-4);
	cursor: pointer;
	padding: 2px;
	border-radius: 4px;
	flex-shrink: 0;
	transition: color 120ms var(--ease-out), background 120ms var(--ease-out);
}
.w-date__clear:hover {
	color: var(--ink);
	background: var(--stone-100);
}

/* ---- Popover ---- */
.w-date__popover {
	width: 280px;
	padding: 12px;
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 12px;
	box-shadow:
		0 12px 36px rgba(0, 0, 0, 0.12),
		0 4px 12px rgba(0, 0, 0, 0.06);
	font-family: var(--font-sans);
}

/* ---- Header ---- */
.w-date__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 4px;
	margin-bottom: 8px;
}
.w-date__nav {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 30px;
	height: 30px;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: var(--fg-2);
	cursor: pointer;
	transition: background 120ms var(--ease-out);
}
.w-date__nav:hover:not(:disabled) {
	background: var(--stone-100);
	color: var(--ink);
}
.w-date__nav:disabled {
	opacity: 0.35;
	cursor: not-allowed;
}
.w-date__title {
	flex: 1;
	border: none;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 13.5px;
	font-weight: 600;
	color: var(--ink);
	cursor: pointer;
	padding: 6px 8px;
	border-radius: 8px;
	transition: background 120ms var(--ease-out);
}
.w-date__title:hover {
	background: var(--stone-100);
}

/* ---- Weekday header ---- */
.w-date__weekdays {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	margin-bottom: 4px;
}
.w-date__weekday {
	text-align: center;
	font-size: 11px;
	font-weight: 500;
	color: var(--fg-4);
	text-transform: uppercase;
	letter-spacing: 0.04em;
	padding: 4px 0;
}

/* ---- Days grid ---- */
.w-date__grid {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 2px;
}
.w-date__day {
	display: flex;
	align-items: center;
	justify-content: center;
	aspect-ratio: 1;
	border: none;
	border-radius: 8px;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 13px;
	color: var(--fg-1);
	cursor: pointer;
	transition: background 80ms var(--ease-out), color 80ms var(--ease-out);
}
.w-date__day:hover:not(:disabled) {
	background: var(--stone-100);
}
.w-date__day--outside {
	color: var(--fg-4);
	opacity: 0.55;
}
.w-date__day--today {
	font-weight: 600;
	color: var(--wise);
}
.w-date__day--selected,
.w-date__day--selected:hover {
	background: var(--wise);
	color: var(--paper-warm);
	font-weight: 600;
}
.w-date__day--focused:not(.w-date__day--selected) {
	box-shadow: inset 0 0 0 2px var(--wise);
}
.w-date__day:focus-visible {
	outline: none;
}
.w-date__day:disabled {
	color: var(--fg-4);
	opacity: 0.3;
	cursor: not-allowed;
}

/* ---- Months / Years grids ---- */
.w-date__months,
.w-date__years {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 6px;
}
.w-date__month,
.w-date__year {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 12px 0;
	border: none;
	border-radius: 8px;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 13px;
	color: var(--fg-1);
	cursor: pointer;
	transition: background 80ms var(--ease-out), color 80ms var(--ease-out);
}
.w-date__month:hover:not(:disabled),
.w-date__year:hover:not(:disabled) {
	background: var(--stone-100);
}
.w-date__month--current,
.w-date__year--current {
	font-weight: 600;
	color: var(--wise);
}
.w-date__month--selected,
.w-date__month--selected:hover,
.w-date__year--selected,
.w-date__year--selected:hover {
	background: var(--wise);
	color: var(--paper-warm);
	font-weight: 600;
}
.w-date__month:disabled,
.w-date__year:disabled {
	opacity: 0.3;
	cursor: not-allowed;
}

/* ---- Footer ---- */
.w-date__footer {
	display: flex;
	justify-content: space-between;
	gap: 8px;
	margin-top: 10px;
	padding-top: 10px;
	border-top: 1px solid var(--line);
}
.w-date__shortcut {
	border: none;
	background: transparent;
	font-family: var(--font-sans);
	font-size: 12.5px;
	font-weight: 500;
	color: var(--wise);
	cursor: pointer;
	padding: 4px 8px;
	border-radius: 6px;
	transition: background 120ms var(--ease-out);
}
.w-date__shortcut:hover:not(:disabled) {
	background: var(--wise-mist);
}
.w-date__shortcut--muted {
	color: var(--fg-3);
	margin-left: auto;
}
.w-date__shortcut--muted:hover {
	background: var(--stone-100);
}
.w-date__shortcut:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}

/* ---- Hint / error ---- */
.w-date__hint {
	font-size: 12px;
	color: var(--fg-4);
}
.w-date__error {
	font-size: 12px;
	color: var(--loss);
}

/* ---- Transition ---- */
.w-date-drop-enter-active {
	transition: opacity 120ms var(--ease-out), transform 120ms var(--ease-out);
}
.w-date-drop-leave-active {
	transition: opacity 80ms ease-in, transform 80ms ease-in;
}
.w-date-drop-enter-from,
.w-date-drop-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
