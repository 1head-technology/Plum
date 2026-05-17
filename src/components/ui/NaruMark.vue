<template>
	<span class="naru-mark" :style="markStyle">{{ char }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
	size?: number;
	char?: string;
	color?: string;
}>(), {
	size: 24,
	char: "な",
});

const markStyle = computed(() => ({
	fontFamily: "var(--font-jp)",
	fontSize: `${props.size}px`,
	lineHeight: 1,
	letterSpacing: "-0.02em",
	fontWeight: 300,
	color: props.color || "inherit",
	display: "inline-block",
}));
</script>
