<template>
	<div class="account-row">
		<AvatarMark :size="36" />
		<div class="account-row__info">
			<div class="account-row__name">{{ account.name }}</div>
			<div class="account-row__detail">{{ account.type }}</div>
		</div>
		<WMoney :value="balance" :size="15" :weight="500" :tone="balance < 0 ? 'loss' : undefined" />
		<button
			class="account-row__action"
			aria-label="Edit account"
			@click="$emit('edit', account)">
			<Pencil :size="15" />
		</button>
		<button
			class="account-row__action account-row__action--danger"
			aria-label="Delete account"
			@click="isConfirmOpen = true">
			<Trash2 :size="16" />
		</button>

		<WModal
			v-model:is-open="isConfirmOpen"
			title="Delete account"
			size="sm">
			<p class="account-row__confirm-text">
				Are you sure you want to delete <strong>{{ account.name }}</strong>?
				This action cannot be undone.
			</p>
			<template #footer>
				<WButton variant="ghost" :disabled="deleting" @click="isConfirmOpen = false">
					Cancel
				</WButton>
				<WButton variant="loss" :disabled="deleting" @click="onConfirmDelete">
					{{ deleting ? "Deleting..." : "Delete" }}
				</WButton>
			</template>
		</WModal>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Pencil, Trash2 } from "lucide-vue-next";
import { AvatarMark, WMoney, WModal, WButton } from "@/components/ui";
import { useAccountsStore } from "@/stores/accounts";
import type { Account } from "@/api";

const props = defineProps<{
	account: Account;
	balance: number;
}>();

defineEmits<{
	edit: [account: Account];
}>();

const accountsStore = useAccountsStore();
const isConfirmOpen = ref(false);
const deleting = ref(false);

async function onConfirmDelete() {
	deleting.value = true;
	try {
		await accountsStore.remove(props.account.id);
		isConfirmOpen.value = false;
	}
	finally {
		deleting.value = false;
	}
}
</script>

<style scoped>
.account-row {
	display: grid;
	grid-template-columns: 36px 1fr auto auto auto;
	gap: 12px;
	padding: 12px 0;
	border-bottom: 1px solid var(--line);
	align-items: center;
}
.account-row__name { font-size: 14px; color: var(--ink); font-weight: 500; }
.account-row__detail { font-size: 11px; color: var(--fg-4); letter-spacing: 0.04em; margin-top: 2px; }

.account-row__action {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border: none;
	border-radius: 8px;
	background: transparent;
	color: var(--fg-3);
	cursor: pointer;
	transition:
		background 120ms var(--ease-out),
		color 120ms var(--ease-out);
}
.account-row__action:hover {
	background: var(--stone-100);
	color: var(--ink);
}
.account-row__action--danger:hover {
	color: var(--loss, #b3261e);
}

.account-row__confirm-text {
	margin: 0;
	color: var(--fg-1);
	font-size: 14px;
	line-height: 1.5;
}
</style>
