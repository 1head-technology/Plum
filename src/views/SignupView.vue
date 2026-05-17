<template>
	<main class="auth-page">
		<h1>Sign Up</h1>
		<form @submit.prevent="handleSignup">
			<label>
				Name
				<input v-model="form.name" type="text" required />
			</label>
			<label>
				Email
				<input v-model="form.email" type="email" required />
			</label>
			<label>
				Password
				<input v-model="form.password" type="password" required />
			</label>
			<label>
				Default Currency
				<input v-model="form.defaultCurrency" type="text" placeholder="EUR" required />
			</label>
			<button type="submit" :disabled="session.loading">
				{{ session.loading ? "Creating account..." : "Sign Up" }}
			</button>
			<p v-if="session.error" class="error">{{ session.error }}</p>
		</form>
		<p><router-link to="/login">Already have an account? Login</router-link></p>
	</main>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const router = useRouter();

const form = reactive({
	name: "",
	email: "",
	password: "",
	defaultCurrency: "EUR",
});

async function handleSignup() {
	await session.signup(form);
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
