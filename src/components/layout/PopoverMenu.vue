<template>
	<Teleport to="body">
		<Transition name="menu-fade">
			<div v-if="open" class="menu-backdrop" @click="$emit('close')">
				<div class="menu" :style="menuPosition" @click.stop>
					<template v-for="(item, i) in items" :key="item.id ?? `sep-${i}`">
						<div v-if="item.type === 'separator'" class="menu__divider" />
						<button
							v-else
							class="menu__item"
							:class="{ 'menu__item--danger': item.type === 'danger' }"
							@click="handleClick(item)"
						>
							<component v-if="item.icon" :is="item.icon" :size="16" class="menu__item-icon" />
							<span class="menu__item-label">{{ item.label }}</span>
							<span v-if="item.shortcut" class="menu__item-shortcut">{{ item.shortcut }}</span>
						</button>
					</template>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";

export interface MenuItem {
	id?: string;
	label?: string;
	icon?: Component;
	shortcut?: string;
	type?: "default" | "danger" | "separator";
}

const props = defineProps<{
	open: boolean;
	items: MenuItem[];
	anchorBottom?: number;
	anchorLeft?: number;
}>();

const emit = defineEmits<{
	close: [];
	select: [id: string];
}>();

const menuPosition = computed(() => ({
	bottom: `${props.anchorBottom ?? 80}px`,
	left: `${props.anchorLeft ?? 14}px`,
}));

function handleClick(item: MenuItem) {
	if (item.id) {
		emit("select", item.id);
	}
	emit("close");
}
</script>

<style scoped>
.menu-backdrop {
	position: fixed;
	inset: 0;
	z-index: 1000;
}

.menu {
	position: fixed;
	width: 220px;
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 12px;
	padding: 6px;
	box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.06);
	z-index: 1001;
}

.menu__divider {
	height: 1px;
	background: var(--line);
	margin: 4px 8px;
}

.menu__item {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 9px 12px;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: var(--fg-1);
	font-size: 13px;
	font-weight: 400;
	font-family: var(--font-sans);
	cursor: pointer;
	text-align: left;
	transition: background 100ms var(--ease-out);
}
.menu__item:hover {
	background: var(--stone-100);
}

.menu__item-icon {
	color: var(--fg-3);
	flex-shrink: 0;
}

.menu__item-label {
	flex: 1;
}

.menu__item-shortcut {
	font-size: 11px;
	color: var(--fg-4);
	font-family: var(--font-sans);
	letter-spacing: 0.02em;
}

.menu__item--danger {
	color: var(--loss);
}
.menu__item--danger .menu__item-icon {
	color: var(--loss);
}
.menu__item--danger:hover {
	background: var(--loss-soft);
}

/* Transition */
.menu-fade-enter-active {
	transition: opacity 120ms var(--ease-out);
}
.menu-fade-enter-active .menu {
	transition: opacity 120ms var(--ease-out), transform 120ms var(--ease-out);
}
.menu-fade-leave-active {
	transition: opacity 80ms ease-in;
}
.menu-fade-leave-active .menu {
	transition: opacity 80ms ease-in, transform 80ms ease-in;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
	opacity: 0;
}
.menu-fade-enter-from .menu,
.menu-fade-leave-to .menu {
	opacity: 0;
	transform: translateY(8px) scale(0.97);
}
</style>
