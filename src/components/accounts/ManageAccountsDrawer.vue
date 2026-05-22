<template>
	<Teleport to="body">
		<div
			v-if="open"
			role="dialog"
			aria-modal="true"
			:aria-label="`Manage ${groupLabel} accounts`"
			class="drawer-overlay"
		>
			<!-- scrim -->
			<div
				class="drawer-overlay__scrim"
				:class="{ 'drawer-overlay__scrim--enter': entered }"
				@click="$emit('close')"
			/>

			<!-- drawer panel -->
			<div class="drawer" :class="{ 'drawer--enter': entered }">
				<!-- HEADER -->
				<header class="drawer__header">
					<div class="drawer__header-top">
						<div>
							<WEyebrow v-if="groupLabel">
								manage {{ groupLabel.toLowerCase() }}
							</WEyebrow>
							<h2 class="drawer__title" v-if="groupEyebrow">
								{{ groupEyebrow.charAt(0).toUpperCase() + groupEyebrow.slice(1) }}
							</h2>
							<div class="drawer__subtitle">
								{{ accounts.length }}
								{{ accounts.length === 1 ? "account" : "accounts" }}
							</div>
						</div>
						<button
							class="drawer__close-btn"
							aria-label="Close"
							@click="$emit('close')"
						>
							×
						</button>
					</div>

					<WInput
						v-if="accounts.length > 2"
						:value="filter"
						icon="search"
						placeholder="filter accounts"
						size="sm"
						class="drawer__filter"
						@update:value="filter = $event"
					>
						<template v-if="filter" #trailing>
							<button
								class="drawer__filter-clear"
								aria-label="Clear filter"
								@click="filter = ''"
							>
								×
							</button>
						</template>
					</WInput>
				</header>

				<!-- BODY -->
				<div class="drawer__body">
					<!-- empty state -->
					<div v-if="filteredAccounts.length === 0" class="drawer__empty">
						<div class="drawer__empty-glyph">な</div>
						<div class="drawer__empty-title">
							{{
								filter ? `No accounts match "${filter}".` : "No accounts here yet."
							}}
						</div>
						<div class="drawer__empty-hint">
							{{ filter ? "Try a shorter query." : "Add one to get started." }}
						</div>
					</div>

					<div v-else role="list">
						<ManageDrawerRow
							v-for="account in filteredAccounts"
							:key="account.id"
							:account="account"
							:balance="balanceFor(account)"
							:expanded="expandedId === account.id"
							@toggle-expand="
								expandedId = expandedId === account.id ? null : account.id
							"
							@update="(patch) => onUpdateLocalAccount(account, patch)"
						/>
					</div>
				</div>

				<!-- FOOTER -->
				<footer class="drawer__footer">
					<WButton type="button" variant="dark" @click="onPatchAccounts"> done </WButton>
				</footer>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { WButton, WEyebrow, WInput } from "@/components/ui";
import ManageDrawerRow from "@/components/accounts/ManageDrawerRow.vue";
import { useScrollLock } from "@/composables/useScrollLock";
import type { Account, AccountBalance, UUID } from "@/api";

const props = withDefaults(
	defineProps<{
		open: boolean;
		groupLabel?: string;
		groupEyebrow?: string;
		initialAccounts?: Account[];
		balances?: Record<UUID, AccountBalance>;
	}>(),
	{
		groupLabel: "Cash",
		groupEyebrow: "checking & savings",
		initialAccounts: () => [],
		balances: () => ({}),
	},
);

const emit = defineEmits<{
	close: [];
	patch: [accounts: Account[]];
}>();

// ---- State ----
const accounts = ref<Account[]>([]);
const expandedId = ref<string | null>(null);
const filter = ref("");
const entered = ref(false);

const { lock: lockScroll, unlock: unlockScroll } = useScrollLock();

// ---- Animate in / reset on open ----
watch(
	() => props.open,
	(open) => {
		if (open) {
			accounts.value = props.initialAccounts.map((a) => ({ ...a }));
			expandedId.value = null;
			filter.value = "";
			lockScroll();
			requestAnimationFrame(() => {
				entered.value = true;
			});
		} else {
			entered.value = false;
			unlockScroll();
		}
	},
);

// ---- Escape key ----
function onKeydown(e: KeyboardEvent) {
	if (e.key !== "Escape") {
		return;
	}

	if (expandedId.value != null) {
		expandedId.value = null;
	} else {
		emit("close");
	}
}

watch(
	() => props.open,
	(open) => {
		if (open) {
			window.addEventListener("keydown", onKeydown);
		} else {
			window.removeEventListener("keydown", onKeydown);
		}
	},
);

onBeforeUnmount(() => {
	window.removeEventListener("keydown", onKeydown);
});

// ---- Filter ----
const filteredAccounts = computed(() => {
	const filterQuery = filter.value.trim().toLowerCase();

	if (!filterQuery) {
		return accounts.value;
	}

	return accounts.value.filter(
		(a) =>
			a.name.toLowerCase().includes(filterQuery) ||
			a.type.toLowerCase().includes(filterQuery),
	);
});

function balanceFor(account: Account): number {
	return props.balances[account.id]?.balance ?? account.initialBalance;
}

// ---- Update handler ----
function onUpdateLocalAccount(account: Account, patch: Partial<Account>) {
	accounts.value = accounts.value.map((a) => (a.id === account.id ? { ...a, ...patch } : a));
}

function onPatchAccounts() {
	emit("patch", accounts.value);
	emit("close");
}
</script>

<style scoped>
/* ---- Overlay ---- */
.drawer-overlay {
	position: fixed;
	inset: 0;
	z-index: 60;
}

/* ---- Scrim ---- */
.drawer-overlay__scrim {
	position: absolute;
	inset: 0;
	background: rgba(26, 26, 26, 0.22);
	opacity: 0;
	transition: opacity 220ms var(--ease-out);
}
.drawer-overlay__scrim--enter {
	opacity: 1;
}

/* ---- Panel ---- */
.drawer {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	width: min(520px, 96vw);
	background: var(--paper);
	box-shadow: -18px 0 50px rgba(20, 16, 10, 0.1);
	display: flex;
	flex-direction: column;
	font-family: var(--font-sans);
	transform: translateX(24px);
	opacity: 0;
	transition:
		transform 260ms var(--ease-out),
		opacity 220ms var(--ease-out);
}
.drawer--enter {
	transform: translateX(0);
	opacity: 1;
}

/* ---- Header ---- */
.drawer__header {
	padding: 24px 28px 18px;
	border-bottom: 1px solid var(--line);
}
.drawer__header-top {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
}
.drawer__title {
	font-size: 22px;
	color: var(--ink);
	font-weight: 500;
	margin: 8px 0 0;
	letter-spacing: -0.01em;
}
.drawer__subtitle {
	font-size: 12.5px;
	color: var(--fg-3);
	margin-top: 4px;
}
.drawer__close-btn {
	width: 32px;
	height: 32px;
	padding: 0;
	border: 1px solid transparent;
	background: transparent;
	border-radius: 6px;
	cursor: pointer;
	color: var(--fg-3);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 18px;
	line-height: 1;
	transition: background 120ms var(--ease-out);
}
.drawer__close-btn:hover {
	background: var(--stone-100);
}
.drawer__filter {
	margin-top: 18px;
}
.drawer__filter-clear {
	border: 0;
	background: transparent;
	color: var(--fg-4);
	font-size: 13px;
	cursor: pointer;
	padding: 0;
}

/* ---- Body ---- */
.drawer__body {
	flex: 1;
	overflow-y: auto;
	padding: 8px 16px 24px;

	&:has(.drawer__empty) {
		display: flex;
		justify-content: center;
		align-items: center;
	}
}

/* ---- Empty state ---- */
.drawer__empty {
	text-align: center;
	padding: 48px 20px 40px;
	color: var(--fg-3);
}
.drawer__empty-glyph {
	font-family: var(--font-jp);
	font-size: 56px;
	font-weight: 300;
	color: var(--stone-300);
	line-height: 1;
}
.drawer__empty-title {
	font-size: 14px;
	color: var(--fg-2);
	margin-top: 16px;
}
.drawer__empty-hint {
	font-size: 12px;
	color: var(--fg-4);
	margin-top: 6px;
}

/* ---- Footer ---- */
.drawer__footer {
	border-top: 1px solid var(--line);
	padding: 14px 22px;
	display: flex;
	justify-content: flex-end;
}
.drawer__footer-done {
	border: 0;
	background: var(--ink);
	color: var(--paper-warm);
	cursor: pointer;
	font-size: 12.5px;
	font-weight: 500;
	font-family: var(--font-sans);
	padding: 8px 20px;
	border-radius: 6px;
	transition: background 120ms var(--ease-out);
}
.drawer__footer-done:hover {
	background: var(--stone-700);
}
</style>
