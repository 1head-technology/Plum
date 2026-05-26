<template>
	<aside class="sidebar">
		<!-- brand -->
		<div class="sidebar__brand">
			<NaruMark :size="28" char="な" color="var(--wise)" />
			<span class="sidebar__brand-name">Naru</span>
			<span class="sidebar__brand-sub">wise</span>
		</div>

		<div class="sidebar__group-label">
			<WEyebrow>main</WEyebrow>
		</div>
		<button
			v-for="item in mainMenuItems"
			:key="item.id"
			class="nav-item"
			:class="{ 'nav-item--active': route === item.id }"
			@click="$emit('navigate', item?.id ?? 'dashboard')"
		>
			<component :is="item.icon" :size="16" class="nav-item__icon" />
			{{ item.label }}
		</button>

		<div class="sidebar__group-label sidebar__group-label--spaced">
			<WEyebrow>more</WEyebrow>
		</div>
		<button
			v-for="item in mainMenuSubItems"
			:key="item.id"
			class="nav-item"
			:class="{ 'nav-item--active': route === item.id }"
			@click="$emit('navigate', item?.id ?? 'settings')"
		>
			<component :is="item.icon" :size="16" class="nav-item__icon" />
			{{ item.label }}
		</button>

		<div class="sidebar__spacer" />

		<!-- user card -->
		<button ref="userCardRef" class="sidebar__user" @click="menuOpen = !menuOpen">
			<AvatarMark :size="32" char="な" tone="accent" />
			<div class="sidebar__user-info">
				<div class="sidebar__user-name">{{ userName }}</div>
				<div class="sidebar__user-role">{{ userRole }}</div>
			</div>
			<ChevronsUpDown :size="14" class="sidebar__user-chevron" />
		</button>

		<PopoverMenu
			:open="menuOpen"
			:items="popoverMenuItems"
			:anchor="userCardRef"
			@close="menuOpen = false"
			@select="onPopoverMenuItemSelect"
		/>
	</aside>
</template>

<script setup lang="ts">
import { ref, toRef } from "vue";
import {
	LayoutGrid,
	Wallet,
	ArrowLeftRight,
	PieChart,
	Target,
	Settings,
	LifeBuoy,
	ChevronsUpDown,
	User,
	LogOut,
} from "lucide-vue-next";
import { NaruMark, WEyebrow, AvatarMark } from "@/components/ui";
import { type MenuItem } from "@/data/types.ts";
import PopoverMenu from "./PopoverMenu.vue";

// Props
const props = defineProps<{
	route: string;
	userName?: string;
	userRole?: string;
	userEmail?: string;
}>();

// Emits
const emit = defineEmits<{
	navigate: [id: string];
	logout: [];
}>();

// State
const route = toRef(props, "route");
const userName = toRef(props, "userName");
const userRole = toRef(props, "userRole");

const menuOpen = ref(false);
const userCardRef = ref<HTMLElement | null>(null);


// Functions
function onPopoverMenuItemSelect(id: string) {
	if (id === "logout") {
		emit("logout");
	} else {
		emit("navigate", id);
	}
}

// Constants
const mainMenuItems: MenuItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutGrid },
	{ id: "accounts", label: "Accounts", icon: Wallet },
	{ id: "transactions", label: "Transactions", icon: ArrowLeftRight },
	{ id: "budgets", label: "Budgets", icon: PieChart },
	{ id: "goals", label: "Goals", icon: Target },
];

const mainMenuSubItems: MenuItem[] = [
	{ id: "settings", label: "Settings", icon: Settings },
	{ id: "help", label: "Help", icon: LifeBuoy },
];

const popoverMenuItems: MenuItem[] = [
	{ id: "account", label: "Account", icon: User },
	{ id: "settings", label: "Settings", icon: Settings, shortcut: "⌘," },
	{ id: "help", label: "Help", icon: LifeBuoy },
	{ type: "separator" },
	{ id: "logout", label: "Log out", icon: LogOut, type: "danger" },
];
</script>

<style scoped>
.sidebar {
	width: 232px;
	background: var(--paper-warm);
	border-right: 1px solid var(--line);
	padding: 20px 14px;
	display: flex;
	flex-direction: column;
	gap: 4px;
	flex-shrink: 0;
	height: 100vh;
	position: sticky;
	top: 0;
}

.sidebar__brand {
	padding: 6px 10px 18px;
	display: flex;
	align-items: baseline;
	gap: 8px;
}
.sidebar__brand-name {
	font-size: 13px;
	color: var(--fg-1);
	font-weight: 500;
}
.sidebar__brand-sub {
	font-size: 11px;
	color: var(--fg-4);
	letter-spacing: 0.18em;
	text-transform: lowercase;
}

.sidebar__group-label {
	padding: 0 10px;
	margin-bottom: 4px;
}
.sidebar__group-label--spaced {
	margin-top: 18px;
}

.nav-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border-radius: 8px;
	border: 0;
	background: transparent;
	color: var(--fg-2);
	font-size: 13px;
	font-weight: 500;
	font-family: var(--font-sans);
	cursor: pointer;
	text-align: left;
	transition: background 120ms var(--ease-out);
}
.nav-item:hover {
	background: var(--stone-100);
}
.nav-item--active {
	background: var(--ink);
	color: var(--paper-warm);
}
.nav-item--active:hover {
	background: var(--ink);
}

.nav-item__icon {
	color: var(--fg-3);
}
.nav-item--active .nav-item__icon {
	color: var(--paper-warm);
}

.sidebar__spacer {
	flex: 1;
}

.sidebar__user {
	margin-top: 12px;
	padding: 12px;
	background: var(--stone-100);
	border-radius: 10px;
	display: flex;
	align-items: center;
	gap: 10px;
	border: none;
	width: 100%;
	cursor: pointer;
	font-family: var(--font-sans);
	text-align: left;
	transition: background 120ms var(--ease-out);
}
.sidebar__user:hover {
	background: var(--stone-200);
}
.sidebar__user-info {
	flex: 1;
	min-width: 0;
}
.sidebar__user-name {
	font-size: 12px;
	font-weight: 500;
	color: var(--ink);
}
.sidebar__user-role {
	font-size: 10px;
	color: var(--fg-4);
	letter-spacing: 0.04em;
}
.sidebar__user-chevron {
	color: var(--fg-4);
}
</style>
