<template>
	<main class="dashboard">
		<header class="dashboard-header">
			<h1>Dashboard</h1>
			<div>
				<span>{{ session.user?.name }} ({{ session.user?.email }})</span>
				<button @click="handleSignOut">Sign Out</button>
			</div>
		</header>

		<!-- Accounts -->
		<section>
			<h2>Accounts</h2>
			<form @submit.prevent="createAccount" class="inline-form">
				<input v-model="newAccount.name" placeholder="Account name" required />
				<select v-model="newAccount.type">
					<option value="CHECKING">Checking</option>
					<option value="SAVINGS">Savings</option>
					<option value="CREDIT_CARD">Credit Card</option>
					<option value="CASH">Cash</option>
					<option value="INVESTMENT">Investment</option>
					<option value="BANK_ACCOUNT">Bank Account</option>
				</select>
				<input v-model.number="newAccount.initialBalance" type="number" step="0.01" placeholder="Initial balance" required />
				<input v-model="newAccount.currency" placeholder="EUR" required />
				<button type="submit">Add Account</button>
			</form>
			<p v-if="accountsStore.loading">Loading accounts...</p>
			<p v-if="accountsStore.error" class="error">{{ accountsStore.error }}</p>
			<table v-if="accountsStore.accounts.length">
				<thead>
					<tr><th>Name</th><th>Type</th><th>Currency</th><th>Balance</th></tr>
				</thead>
				<tbody>
					<tr v-for="acc in accountsStore.accounts" :key="acc.id">
						<td>{{ acc.name }}</td>
						<td>{{ acc.type }}</td>
						<td>{{ acc.currency }}</td>
						<td>{{ accountsStore.balanceFor(acc.id) ?? "—" }}</td>
					</tr>
				</tbody>
			</table>
			<p><strong>Total balance:</strong> {{ accountsStore.totalBalance }}</p>
		</section>

		<!-- Categories -->
		<section>
			<h2>Categories</h2>
			<form @submit.prevent="createCategory" class="inline-form">
				<input v-model="newCategory.name" placeholder="Category name" required />
				<select v-model="newCategory.type">
					<option value="EXPENSE">Expense</option>
					<option value="INCOME">Income</option>
				</select>
				<button type="submit">Add Category</button>
			</form>
			<p v-if="categoriesStore.loading">Loading categories...</p>
			<p v-if="categoriesStore.error" class="error">{{ categoriesStore.error }}</p>
			<ul v-if="categoriesStore.categories.length">
				<li v-for="cat in categoriesStore.categories" :key="cat.id">
					{{ cat.name }} <small>({{ cat.type }}{{ cat.system ? ", system" : "" }})</small>
				</li>
			</ul>
		</section>

		<!-- Transactions -->
		<section>
			<h2>Transactions</h2>
			<form @submit.prevent="recordTransaction" class="inline-form">
				<select v-model="newTx.accountId" required>
					<option value="" disabled>Select account</option>
					<option v-for="acc in accountsStore.accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
				</select>
				<select v-model="newTx.type">
					<option value="EXPENSE">Expense</option>
					<option value="INCOME">Income</option>
				</select>
				<input v-model.number="newTx.amount" type="number" step="0.01" placeholder="Amount" required />
				<input v-model="newTx.currency" placeholder="EUR" required />
				<input v-model="newTx.date" type="date" required />
				<input v-model="newTx.description" placeholder="Description" />
				<select v-model="newTx.categoryId">
					<option value="">No category</option>
					<option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
				</select>
				<button type="submit">Record</button>
			</form>
			<p v-if="transactionsStore.loading">Loading transactions...</p>
			<p v-if="transactionsStore.error" class="error">{{ transactionsStore.error }}</p>
			<table v-if="transactionsStore.ordered.length">
				<thead>
					<tr><th>Date</th><th>Type</th><th>Amount</th><th>Description</th><th>Category</th></tr>
				</thead>
				<tbody>
					<tr v-for="tx in transactionsStore.ordered" :key="tx.id">
						<td>{{ tx.date }}</td>
						<td>{{ tx.type }}</td>
						<td>{{ tx.amount }} {{ tx.currency }}</td>
						<td>{{ tx.description ?? "—" }}</td>
						<td>{{ tx.categoryId ? categoriesStore.byId.get(tx.categoryId)?.name : "—" }}</td>
					</tr>
				</tbody>
			</table>
		</section>

		<!-- Budgets -->
		<section>
			<h2>Budgets</h2>
			<form @submit.prevent="createBudget" class="inline-form">
				<input v-model="newBudget.name" placeholder="Budget name" required />
				<input v-model="newBudget.from" type="date" required />
				<input v-model="newBudget.to" type="date" required />
				<button type="submit">Create Budget</button>
			</form>
			<p v-if="budgetsStore.loading">Loading budgets...</p>
			<p v-if="budgetsStore.error" class="error">{{ budgetsStore.error }}</p>
			<ul v-if="budgetsStore.budgets.length">
				<li v-for="b in budgetsStore.budgets" :key="b.id">
					{{ b.name }} ({{ b.from }} → {{ b.to }}) — {{ b.status }}
				</li>
			</ul>
		</section>

		<!-- Savings Goals -->
		<section>
			<h2>Savings Goals</h2>
			<form @submit.prevent="createGoal" class="inline-form">
				<input v-model="newGoal.name" placeholder="Goal name" required />
				<input v-model.number="newGoal.targetAmount" type="number" step="0.01" placeholder="Target amount" required />
				<input v-model="newGoal.currency" placeholder="EUR" required />
				<input v-model="newGoal.deadline" type="date" />
				<button type="submit">Create Goal</button>
			</form>
			<p v-if="savingsStore.loading">Loading goals...</p>
			<p v-if="savingsStore.error" class="error">{{ savingsStore.error }}</p>
			<ul v-if="savingsStore.goals.length">
				<li v-for="g in savingsStore.goals" :key="g.id">
					{{ g.name }}: {{ g.currentAmount }}/{{ g.targetAmount }} {{ g.currency }} — {{ g.status }}
				</li>
			</ul>
		</section>
	</main>
</template>

<script setup lang="ts">
import { onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import { useSessionStore } from "@/stores/session";
import { useAccountsStore } from "@/stores/accounts";
import { useCategoriesStore } from "@/stores/categories";
import { useTransactionsStore } from "@/stores/transactions";
import { useBudgetsStore } from "@/stores/budgets";
import { useSavingsGoalsStore } from "@/stores/savingsGoals";
import type { AccountType, CategoryType, TransactionType } from "@/api";

const router = useRouter();
const session = useSessionStore();
const accountsStore = useAccountsStore();
const categoriesStore = useCategoriesStore();
const transactionsStore = useTransactionsStore();
const budgetsStore = useBudgetsStore();
const savingsStore = useSavingsGoalsStore();

onMounted(() => {
	if (!session.isAuthenticated) {
		router.push("/login");
		return;
	}
	accountsStore.load();
	categoriesStore.load();
	transactionsStore.load();
	budgetsStore.load();
	savingsStore.load();
});

function handleSignOut() {
	session.signOut();
	accountsStore.reset();
	categoriesStore.reset();
	transactionsStore.reset();
	budgetsStore.reset();
	savingsStore.reset();
	router.push("/login");
}

// --- Account creation ---
const newAccount = reactive({
	name: "",
	type: "CHECKING" as AccountType,
	initialBalance: 0,
	currency: "EUR",
});

async function createAccount() {
	await accountsStore.create({
		name: newAccount.name,
		type: newAccount.type,
		initialBalance: newAccount.initialBalance,
		currency: newAccount.currency,
	});
	newAccount.name = "";
	newAccount.initialBalance = 0;
}

// --- Category creation ---
const newCategory = reactive({
	name: "",
	type: "EXPENSE" as CategoryType,
});

async function createCategory() {
	await categoriesStore.create({ name: newCategory.name, type: newCategory.type });
	newCategory.name = "";
}

// --- Transaction recording ---
const newTx = reactive({
	accountId: "",
	type: "EXPENSE" as TransactionType,
	amount: 0,
	currency: "EUR",
	date: new Date().toISOString().slice(0, 10),
	description: "",
	categoryId: "",
});

async function recordTransaction() {
	await transactionsStore.record({
		accountId: newTx.accountId,
		type: newTx.type,
		amount: newTx.amount,
		currency: newTx.currency,
		date: newTx.date,
		description: newTx.description || undefined,
		categoryId: newTx.categoryId || undefined,
		recurring: false,
	});
	newTx.amount = 0;
	newTx.description = "";
	// Refresh balances after transaction
	accountsStore.accounts.forEach((a) => accountsStore.refreshBalance(a.id));
}

// --- Budget creation ---
const newBudget = reactive({
	name: "",
	from: "",
	to: "",
});

async function createBudget() {
	await budgetsStore.create({
		name: newBudget.name,
		from: newBudget.from,
		to: newBudget.to,
		lines: [],
	});

	newBudget.name = "";
	newBudget.from = "";
	newBudget.to = "";
}

// --- Savings goal creation ---
const newGoal = reactive({
	name: "",
	targetAmount: 0,
	currency: "EUR",
	deadline: "",
});

async function createGoal() {
	await savingsStore.create({
		name: newGoal.name,
		targetAmount: newGoal.targetAmount,
		currency: newGoal.currency,
		deadline: newGoal.deadline || undefined,
	});
	newGoal.name = "";
	newGoal.targetAmount = 0;
	newGoal.deadline = "";
}
</script>

<style scoped lang="scss">
.dashboard {
	max-width: 900px;
	margin: 2rem auto;
	padding: 1rem;

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;

		button {
			margin-left: 1rem;
			padding: 0.4rem 0.8rem;
			background: #dc2626;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
		}
	}

	section {
		margin-bottom: 2rem;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
	}

	.inline-form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1rem;

		input, select {
			padding: 0.4rem;
			border: 1px solid #ccc;
			border-radius: 4px;
		}

		button {
			padding: 0.4rem 0.8rem;
			background: #4f46e5;
			color: white;
			border: none;
			border-radius: 4px;
			cursor: pointer;
		}
	}

	table {
		width: 100%;
		border-collapse: collapse;

		th, td {
			text-align: left;
			padding: 0.4rem 0.6rem;
			border-bottom: 1px solid #e5e7eb;
		}

		th {
			font-weight: 600;
		}
	}

	.error {
		color: #dc2626;
	}
}
</style>
