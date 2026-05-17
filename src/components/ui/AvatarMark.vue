<template>
	<div class="avatar-mark" :class="`avatar-mark--${tone}`" :style="avatarStyle">{{ char }}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
	size?: number;
	char?: string;
	tone?: "sunk" | "accent" | "ink";
}>(), {
	size: 32,
	char: "な",
	tone: "sunk",
});

const avatarStyle = computed(() => ({
	width: `${props.size}px`,
	height: `${props.size}px`,
	borderRadius: props.size > 28 ? "50%" : "8px",
	fontSize: `${props.size * 0.45}px`,
}));
</script>

<style scoped>
.avatar-mark {
	display: flex;
	align-items: center;
	justify-content: center;
	font-family: var(--font-jp);
	flex-shrink: 0;
}
.avatar-mark--sunk   { background: var(--stone-100); color: var(--fg-3); }
.avatar-mark--accent { background: var(--wise-mist); color: var(--wise-deep); }
.avatar-mark--ink    { background: var(--ink); color: var(--paper-warm); }
</style>
