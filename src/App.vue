<script lang="ts" setup>
import { RouterView } from "vue-router";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
session.loadFromStorage();
</script>

<template>
	<RouterView />
</template>

<style lang="scss" scoped></style>
