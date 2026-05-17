<template>
	<div class="eyebrow" :style="{ color: color || 'var(--fg-4)' }">— <slot /></div>
</template>

<script setup lang="ts">
defineProps<{
	color?: string;
}>();
</script>

<style scoped>
.eyebrow {
	font-size: 11px;
	letter-spacing: 0.18em;
	text-transform: uppercase;
	font-weight: 500;
}
</style>
