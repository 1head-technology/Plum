<template>
	<div class="section-header">
		<div>
			<WEyebrow v-if="eyebrow">{{ eyebrow }}</WEyebrow>
			<div v-if="title" class="section-header__title">{{ title }}</div>
		</div>
		<slot name="action" />
	</div>
</template>

<script setup lang="ts">
import WEyebrow from "./WEyebrow.vue";

defineProps<{
	eyebrow?: string;
	title?: string;
}>();
</script>

<style scoped>
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-end;
	margin-bottom: 16px;
}
.section-header__title {
	font-size: 22px;
	font-weight: 500;
	color: var(--ink);
	margin-top: 6px;
	letter-spacing: -0.01em;
}
</style>
