import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useSessionStore } from "@/stores/session.ts";
import HomeView from "../views/HomeView.vue";
import AuthView from "@/views/AuthView.vue";

const routes: Array<RouteRecordRaw> = [
	{
		path: "/",
		name: "Home",
		component: HomeView,
		meta: {
			requireAuthentication: true,
		},
	},
	{
		path: "/login",
		name: "Login",
		component: AuthView,
	},
	{
		path: "/signup",
		name: "Signup",
		component: AuthView,
	},
];

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach(async (to, from) => {
	const { isAuthenticated, } = useSessionStore();

	if (to.meta.requireAuthentication && !isAuthenticated) {
		return { name: "Login" };
	}
});

export default router;
