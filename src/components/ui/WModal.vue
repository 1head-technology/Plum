<template>
	<Teleport to="body">
		<Transition name="modal-fade">
			<div
				v-if="isOpen"
				class="modal-backdrop"
				:class="`modal-backdrop--${position}`"
				@click="onBackdrop"
			>
				<div
					ref="dialogRef"
					class="modal"
					:class="[`modal--${size}`, `modal--${position}`]"
					role="dialog"
					aria-modal="true"
					:aria-label="title"
					tabindex="-1"
					@click.stop
				>
					<header v-if="title || $slots.header || showClose" class="modal__header">
						<slot name="header">
							<h2 v-if="title" class="modal__title">{{ title }}</h2>
						</slot>
						<button
							v-if="showClose"
							class="modal__close"
							aria-label="Close"
							@click="close"
						>
							<X :size="18" />
						</button>
					</header>

					<div class="modal__body">
						<slot />
					</div>

					<footer v-if="$slots.footer" class="modal__footer">
						<slot name="footer" />
					</footer>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { X } from "lucide-vue-next";

const props = withDefaults(
	defineProps<{
		isOpen: boolean;
		title?: string;
		size?: "sm" | "md" | "lg" | "xl" | "full";
		position?: "center" | "top" | "bottom" | "left" | "right";
		showClose?: boolean;
		closeOnBackdrop?: boolean;
		closeOnEsc?: boolean;
		lockScroll?: boolean;
	}>(),
	{
		size: "md",
		position: "center",
		showClose: true,
		closeOnBackdrop: true,
		closeOnEsc: true,
		lockScroll: true,
	},
);

const emit = defineEmits<{
	"update:isOpen": [value: boolean];
	close: [];
}>();

const dialogRef = ref<HTMLElement | null>(null);

function close() {
	emit("update:isOpen", false);
	emit("close");
}

function onBackdrop() {
	if (props.closeOnBackdrop) {
		close();
	}
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === "Escape" && props.closeOnEsc) {
		close();
	}
}

watch(
	() => props.isOpen,
	(open) => {
		if (open) {
			document.addEventListener("keydown", onKeydown);
			if (props.lockScroll) document.body.style.overflow = "hidden";
			requestAnimationFrame(() => dialogRef.value?.focus());
		} else {
			document.removeEventListener("keydown", onKeydown);
			if (props.lockScroll) document.body.style.overflow = "";
		}
	},
);

onBeforeUnmount(() => {
	document.removeEventListener("keydown", onKeydown);
	if (props.lockScroll) document.body.style.overflow = "";
});
</script>

<style scoped>
.modal-backdrop {
	position: fixed;
	inset: 0;
	z-index: 1100;
	background: rgba(28, 25, 23, 0.28);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
	display: flex;
	padding: 24px;
}

.modal-backdrop--center {
	align-items: center;
	justify-content: center;
}
.modal-backdrop--top {
	align-items: flex-start;
	justify-content: center;
}
.modal-backdrop--bottom {
	align-items: flex-end;
	justify-content: center;
}
.modal-backdrop--left {
	align-items: stretch;
	justify-content: flex-start;
	padding: 0;
}
.modal-backdrop--right {
	align-items: stretch;
	justify-content: flex-end;
	padding: 0;
}

.modal {
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 16px;
	box-shadow:
		0 24px 64px rgba(0, 0, 0, 0.18),
		0 6px 18px rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	width: 100%;
	max-height: calc(100vh - 48px);
	outline: none;
}

.modal--sm {
	max-width: 380px;
}
.modal--md {
	max-width: 540px;
}
.modal--lg {
	max-width: 760px;
}
.modal--xl {
	max-width: 1040px;
}
.modal--full {
	max-width: none;
	width: calc(100vw - 48px);
	height: calc(100vh - 48px);
	max-height: none;
}

/* Side sheets */
.modal--left,
.modal--right {
	border-radius: 0;
	max-width: 440px;
	height: 100vh;
	max-height: none;
}
.modal--left {
	border-left: none;
}
.modal--right {
	border-right: none;
}

.modal__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 20px 24px;
	border-bottom: 1px solid var(--line);
	flex-shrink: 0;
}

.modal__title {
	font-size: 18px;
	font-weight: 500;
	color: var(--ink);
	letter-spacing: -0.01em;
	margin: 0;
}

.modal__close {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: var(--fg-3);
	cursor: pointer;
	flex-shrink: 0;
	transition:
		background 120ms var(--ease-out),
		color 120ms var(--ease-out);
}
.modal__close:hover {
	background: var(--stone-100);
	color: var(--ink);
}

.modal__body {
	padding: 24px;
	overflow-y: auto;
	flex: 1;
	color: var(--fg-1);
	font-family: var(--font-sans);
	font-size: 14px;
}

.modal__footer {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 10px;
	padding: 16px 24px;
	border-top: 1px solid var(--line);
	flex-shrink: 0;
}

/* Transition */
.modal-fade-enter-active {
	transition: opacity 160ms var(--ease-out);
}
.modal-fade-enter-active .modal {
	transition:
		opacity 160ms var(--ease-out),
		transform 160ms var(--ease-out);
}
.modal-fade-leave-active {
	transition: opacity 120ms ease-in;
}
.modal-fade-leave-active .modal {
	transition:
		opacity 120ms ease-in,
		transform 120ms ease-in;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}
.modal-fade-enter-from .modal--center,
.modal-fade-leave-to .modal--center,
.modal-fade-enter-from .modal--top,
.modal-fade-leave-to .modal--top,
.modal-fade-enter-from .modal--bottom,
.modal-fade-leave-to .modal--bottom {
	transform: translateY(12px) scale(0.97);
}
.modal-fade-enter-from .modal--left,
.modal-fade-leave-to .modal--left {
	transform: translateX(-100%);
}
.modal-fade-enter-from .modal--right,
.modal-fade-leave-to .modal--right {
	transform: translateX(100%);
}
</style>
