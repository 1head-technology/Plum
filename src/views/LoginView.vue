<template>
	<main class="auth-page">
		<h1>Login</h1>
		<form @submit.prevent="handleLogin">
			<label>
				Email
				<input v-model="form.email" type="email" required />
			</label>
			<label>
				Password
				<input v-model="form.password" type="password" required />
			</label>
			<button type="submit" :disabled="session.loading">
				{{ session.loading ? "Logging in..." : "Login" }}
			</button>
			<p v-if="session.error" class="error">{{ session.error }}</p>
		</form>
		<p><router-link to="/signup">Don't have an account? Sign up</router-link></p>
	</main>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const router = useRouter();

const form = reactive({
	email: "",
	password: "",
});

async function handleLogin() {
	await session.login({ email: form.email, password: form.password });
	router.push("/");
}
</script>

<style scoped lang="scss">
.auth-page {
	max-width: 400px;
	margin: 4rem auto;
	padding: 2rem;

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-weight: 600;
	}

	input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 0.75rem;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;

		&:disabled {
			opacity: 0.6;
		}
	}

	.error {
		color: #dc2626;
	}
}
</style>
