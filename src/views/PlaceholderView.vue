<template>
	<div class="placeholder">
		<div class="placeholder__glyph">なる</div>
		<div class="placeholder__text">{{ name }} — not yet wired in this prototype.</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{ name: string }>();
</script>

<style scoped>
.placeholder { padding: 64px; text-align: center; }
.placeholder__glyph { font-family: var(--font-jp); font-size: 88px; color: var(--stone-300); line-height: 1; }
.placeholder__text { font-size: 14px; color: var(--fg-3); margin-top: 16px; }
</style>
