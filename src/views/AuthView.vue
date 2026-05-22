<template>
	<div class="auth">
		<!-- Top bar -->
		<header class="auth-topbar">
			<div class="auth-topbar__brand">
				<NaruMark :size="24" char="な" color="var(--wise)" />
				<span class="auth-topbar__name">naru</span>
				<span class="auth-topbar__sub">wise</span>
			</div>
			<div class="auth-topbar__help">
				need help? <button class="auth-link" @click.prevent>support</button>
			</div>
		</header>

		<!-- Card -->
		<main class="auth-card">
			<!-- Avatar -->
			<div class="auth-card__avatar">
				<AvatarMark :size="72" char="な" tone="accent" />
			</div>

			<WEyebrow style="text-align: center">naru wise</WEyebrow>
			<h1 class="auth-card__title">
				{{ mode === "login" ? "Welcome back." : "Create your account." }}
			</h1>
			<p class="auth-card__subtitle">
				{{
					mode === "login"
						? "pick up where you left off — your accounts, budgets, and goals are waiting."
						: "start tracking your finances — set up accounts, budgets, and goals."
				}}
			</p>

			<!-- Tab switcher -->
			<WSegment
				:value="mode"
				class="auth-tabs"
				@update:value="switchMode($event as 'login' | 'signup')"
			>
				<WSegmentButton value="login">sign in</WSegmentButton>
				<WSegmentButton value="signup">create account</WSegmentButton>
			</WSegment>

			<form @submit.prevent="handleSubmit" class="auth-form">
				<!-- Name (signup only) -->
				<WInput
					v-if="mode === 'signup'"
					v-model:value="form.name"
					label="name"
					placeholder="your name"
					size="lg"
					required
				/>

				<!-- Email -->
				<WInput
					v-model:value="form.email"
					type="email"
					label="email"
					placeholder="you@somewhere.com"
					size="lg"
					required
				/>

				<!-- Password -->
				<div class="auth-field">
					<div class="auth-field__header">
						<WEyebrow>password</WEyebrow>
						<button
							v-if="mode === 'login'"
							type="button"
							class="auth-link auth-link--small"
							@click.prevent
						>
							forgot?
						</button>
					</div>
					<WInput
						v-model:value="form.password"
						type="password"
						placeholder="••••••••"
						size="lg"
						required
					/>
				</div>

				<!-- Currency (signup only) -->
				<WInput
					v-if="mode === 'signup'"
					v-model:value="form.defaultCurrency"
					label="default currency"
					placeholder="EUR"
					size="lg"
					required
				/>

				<!-- Keep signed in (login only) -->
				<label v-if="mode === 'login'" class="auth-checkbox">
					<input type="checkbox" v-model="keepSignedIn" />
					<span>keep me signed in</span>
				</label>

				<!-- Submit -->
				<button type="submit" class="auth-submit" :disabled="session.loading">
					{{
						session.loading
							? "Please wait..."
							: mode === "login"
								? "Sign in"
								: "Create account"
					}}
				</button>

				<p v-if="session.error" class="auth-error">{{ session.error }}</p>
			</form>

			<!-- Divider -->
			<div class="auth-divider">
				<span>or</span>
			</div>

			<!-- Alt sign-in buttons -->
			<div class="auth-alt-buttons">
				<button class="auth-alt-btn" @click.prevent>
					<KeyRound :size="16" />
					use a passkey
				</button>
				<button class="auth-alt-btn" @click.prevent>
					<span class="auth-alt-btn__g">G</span>
					continue with Google
				</button>
			</div>

			<!-- Bottom link -->
			<p class="auth-card__footer">
				<template v-if="mode === 'login'">
					new to wise?
					<button class="auth-link" @click="switchMode('signup')">
						create an account
					</button>
				</template>
				<template v-else>
					already have an account?
					<button class="auth-link" @click="switchMode('login')">sign in</button>
				</template>
			</p>
		</main>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSessionStore } from "@/stores/session";
import { NaruMark, WEyebrow, WInput, AvatarMark, WSegment, WSegmentButton } from "@/components/ui";
import { KeyRound } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const session = useSessionStore();

const mode = ref<"login" | "signup">(route.name === "signup" ? "signup" : "login");
const keepSignedIn = ref(true);

const form = reactive({
	name: "",
	email: "",
	password: "",
	defaultCurrency: "EUR",
});

function switchMode(to: "login" | "signup") {
	mode.value = to;
	session.error = null;
	router.replace(to === "login" ? "/login" : "/signup");
}

async function handleSubmit() {
	if (mode.value === "login") {
		await session.login({ email: form.email, password: form.password });
	} else {
		await session.signup({
			name: form.name,
			email: form.email,
			password: form.password,
			defaultCurrency: form.defaultCurrency,
		});
	}
	await router.push("/");
}
</script>

<style scoped>
.auth {
	min-height: 100vh;
	background: var(--paper);
	display: flex;
	flex-direction: column;
}

/* ---- Top bar ---- */
.auth-topbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 16px 32px;
}
.auth-topbar__brand {
	display: flex;
	align-items: baseline;
	gap: 8px;
}
.auth-topbar__name {
	font-size: 14px;
	color: var(--fg-1);
	font-weight: 500;
}
.auth-topbar__sub {
	font-size: 11px;
	color: var(--fg-4);
	letter-spacing: 0.18em;
	text-transform: lowercase;
}
.auth-topbar__help {
	font-size: 13px;
	color: var(--fg-3);
}

/* ---- Card ---- */
.auth-card {
	width: 100%;
	max-width: 480px;
	margin: 0 auto;
	padding: 48px 48px 40px;
	background: var(--paper-warm);
	border: 1px solid var(--line);
	border-radius: 16px;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.auth-card__avatar {
	margin-bottom: 20px;
}
.auth-card__title {
	font-size: 28px;
	font-weight: 500;
	color: var(--ink);
	letter-spacing: -0.01em;
	margin: 8px 0 0;
	text-align: center;
}
.auth-card__subtitle {
	font-size: 14px;
	color: var(--fg-3);
	text-align: center;
	line-height: 1.5;
	margin: 8px 0 24px;
	max-width: 340px;
}

/* ---- Tabs ---- */
.auth-tabs {
	margin-bottom: 28px;
}

/* ---- Form ---- */
.auth-form {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}
.auth-field {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
.auth-field__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

/* ---- Checkbox ---- */
.auth-checkbox {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 13px;
	color: var(--fg-2);
	cursor: pointer;
}
.auth-checkbox input[type="checkbox"] {
	width: 18px;
	height: 18px;
	accent-color: var(--wise);
	cursor: pointer;
}

/* ---- Submit ---- */
.auth-submit {
	width: 100%;
	padding: 16px;
	background: var(--wise-deep);
	color: var(--paper-warm);
	border: none;
	border-radius: 10px;
	font-size: 15px;
	font-weight: 500;
	font-family: var(--font-sans);
	cursor: pointer;
	transition: background 120ms var(--ease-out);
}
.auth-submit:hover:not(:disabled) {
	background: var(--ink);
}
.auth-submit:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

.auth-error {
	color: var(--loss);
	font-size: 13px;
	text-align: center;
	margin: 0;
}

/* ---- Divider ---- */
.auth-divider {
	width: 100%;
	display: flex;
	align-items: center;
	gap: 16px;
	margin: 24px 0;
}
.auth-divider::before,
.auth-divider::after {
	content: "";
	flex: 1;
	height: 1px;
	background: var(--line);
}
.auth-divider span {
	font-size: 11px;
	color: var(--fg-4);
	letter-spacing: 0.18em;
	text-transform: uppercase;
}

/* ---- Alt buttons ---- */
.auth-alt-buttons {
	width: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 12px;
}
.auth-alt-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 14px 16px;
	background: var(--paper);
	border: 1px solid var(--line);
	border-radius: 10px;
	font-size: 13px;
	font-weight: 500;
	font-family: var(--font-sans);
	color: var(--fg-2);
	cursor: pointer;
	transition: background 120ms var(--ease-out);
}
.auth-alt-btn:hover {
	background: var(--stone-100);
}
.auth-alt-btn__g {
	font-size: 16px;
	font-weight: 600;
	color: #4285f4;
}

/* ---- Footer ---- */
.auth-card__footer {
	margin-top: 24px;
	font-size: 13px;
	color: var(--fg-3);
}

/* ---- Shared link style ---- */
.auth-link {
	background: none;
	border: none;
	color: var(--ink);
	font-weight: 600;
	font-size: inherit;
	font-family: var(--font-sans);
	cursor: pointer;
	padding: 0;
	text-decoration: none;
}
.auth-link:hover {
	text-decoration: underline;
}
.auth-link--small {
	font-size: 13px;
	font-weight: 500;
	color: var(--fg-3);
}
</style>
