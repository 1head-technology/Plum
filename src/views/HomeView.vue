<template>
	<div class="app-shell">
		<AppSidebar
			:route="route"
			:user-name="session.user?.name ?? 'your name'"
			:user-role="'founder · naru'"
			:user-email="session.user?.email"
			@navigate="route = $event"
			@logout="handleLogout"
		/>
		<main class="app-shell__main" v-if="current">
			<AppTopbar :title="current.title" :eyebrow="current.eyebrow">
				<template #actions>
					<div style="display: flex; gap: 8px">
						<WButton variant="ghost" icon="bell" size="md" />
						<WButton
							variant="dark"
							icon="plus"
							size="md"
							@click="onCurrentViewAddEntity"
						>
							Add
						</WButton>
					</div>
				</template>
			</AppTopbar>
			<component
				ref="currentViewRef"
				:is="current.view"
				v-bind="current.props"
				@navigate="route = $event"
			/>
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, type Component } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/session";
import { useAccountsStore } from "@/stores/accounts";
import { useCategoriesStore } from "@/stores/categories";
import { useTransactionsStore } from "@/stores/transactions";
import { useBudgetsStore } from "@/stores/budgets";
import { useSavingsGoalsStore } from "@/stores/savingsGoals";
import { WButton } from "@/components/ui";
import AppSidebar from "@/components/layout/AppSidebar.vue";
import AppTopbar from "@/components/layout/AppTopbar.vue";
import DashboardView from "@/views/DashboardView.vue";
import AccountsView from "@/views/accounts/AccountsView.vue";
import TransactionsView from "@/views/transactions/TransactionsView.vue";
import BudgetsView from "@/views/BudgetsView.vue";
import GoalsView from "@/views/GoalsView.vue";
import PlaceholderView from "@/views/PlaceholderView.vue";

const router = useRouter();
const session = useSessionStore();
const route = ref("dashboard");

interface ViewExposed {
	currentViewAddEntity: () => void;
}

const currentViewRef = ref<ViewExposed | null>(null);

onMounted(() => {
	if (!session.isAuthenticated) {
		router.push("/login");
		return;
	}
	useAccountsStore().load();
	useCategoriesStore().load();
	useTransactionsStore().load();
	useBudgetsStore().load();
	useSavingsGoalsStore().load();
});

function handleLogout() {
	session.signOut();
	useAccountsStore().reset();
	useCategoriesStore().reset();
	useTransactionsStore().reset();
	useBudgetsStore().reset();
	useSavingsGoalsStore().reset();
	router.push("/login");
}

interface RouteEntry {
	title: string;
	eyebrow: string;
	view: Component;
	props?: Record<string, unknown>;
}

const routes: Record<string, RouteEntry> = {
	dashboard: { title: "Welcome back.", eyebrow: "overview", view: DashboardView },
	accounts: { title: "Your accounts.", eyebrow: "accounts", view: AccountsView },
	transactions: { title: "All transactions.", eyebrow: "activity", view: TransactionsView },
	budgets: { title: "Where it goes.", eyebrow: "budgets", view: BudgetsView },
	goals: { title: "What you're saving for.", eyebrow: "goals", view: GoalsView },
	settings: {
		title: "Settings.",
		eyebrow: "preferences",
		view: PlaceholderView,
		props: { name: "Settings" },
	},
	help: { title: "Help.", eyebrow: "support", view: PlaceholderView, props: { name: "Help" } },
};

const current = computed(() => routes[route.value] || routes.dashboard);

const onCurrentViewAddEntity = () => {
	currentViewRef.value?.currentViewAddEntity?.();
};
</script>

<style scoped>
.app-shell {
	display: flex;
	min-height: 100vh;
	background: var(--paper);
}
.app-shell__main {
	flex: 1;
	min-width: 0;
}
</style>
