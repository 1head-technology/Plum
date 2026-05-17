import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { authApi, TOKEN_STORAGE_KEY, type User } from "@/api";

const USER_STORAGE_KEY = "plum.user";

export const useSessionStore = defineStore("session", () => {
	const user = ref<User | null>(null);
	const loading = ref(false);
	const error = ref<string | null>(null);

	const isAuthenticated = computed(() => user.value !== null);

	function loadFromStorage(): void {
		const stored = localStorage.getItem(USER_STORAGE_KEY);
		const token = localStorage.getItem(TOKEN_STORAGE_KEY);

		if (stored && token) {
			user.value = JSON.parse(stored);
		}
	}

	async function signup(payload: { name: string; email: string; password: string; defaultCurrency: string }): Promise<void> {
		loading.value = true;
		error.value = null;

		try {
			const { user: created, token } = await authApi.signup(payload);
			user.value = created;
			localStorage.setItem(TOKEN_STORAGE_KEY, token);
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(created));
		}
		catch (err) {
			error.value = err instanceof Error ? err.message : "Sign up failed";
			throw err;
		}
		finally {
			loading.value = false;
		}
	}

	async function login(payload: { email: string; password: string }): Promise<void> {
		loading.value = true;
		error.value = null;

		try {
			const { user: logged, token } = await authApi.login(payload);
			user.value = logged;
			localStorage.setItem(TOKEN_STORAGE_KEY, token);
			localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(logged));
		}
		catch (err) {
			error.value = err instanceof Error ? err.message : "Login failed";
			throw err;
		}
		finally {
			loading.value = false;
		}
	}

	function signOut(): void {
		user.value = null;
		localStorage.removeItem(TOKEN_STORAGE_KEY);
		localStorage.removeItem(USER_STORAGE_KEY);
	}

	return {
		user,
		loading,
		error,
		isAuthenticated,
		loadFromStorage,
		signup,
		login,
		signOut,
	};
});
