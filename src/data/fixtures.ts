import type { Account, AccountBalance, Transaction, Category, Budget, BudgetLineSummary, SavingsGoal, AccountType } from "@/api";

export interface DisplayAccount {
	id: string;
	name: string;
	type: "checking" | "savings" | "credit" | "invest";
	balance: number;
	currency: string;
	char: string;
	tone: "sunk" | "accent";
}

export interface DisplayTransaction {
	id: string;
	date: string;
	name: string;
	cat: string;
	amount: number;
	status: "cleared" | "pending";
}

export interface DisplayBudget {
	cat: string;
	spent: number;
	cap: number;
	tone: "accent" | "warn" | "loss";
}

export interface DisplayGoal {
	id: string;
	name: string;
	saved: number;
	target: number;
	currency: string;
	tone: "accent" | "warn";
	tag: string;
}

const typeMap: Record<AccountType, DisplayAccount["type"]> = {
	CHECKING: "checking",
	SAVINGS: "savings",
	CREDIT_CARD: "credit",
	CASH: "checking",
	INVESTMENT: "invest",
	BANK_ACCOUNT: "checking",
};

const charPool = ["な", "る"];

export function toDisplayAccount(account: Account, balance: AccountBalance | null): DisplayAccount {
	const mappedType = typeMap[account.type] ?? "checking";
	return {
		id: account.id,
		name: account.name,
		type: mappedType,
		balance: balance?.balance ?? account.initialBalance,
		currency: account.currency,
		char: charPool[account.name.length % 2],
		tone: mappedType === "savings" || mappedType === "invest" ? "accent" : "sunk",
	};
}

export function toDisplayTransaction(
	tx: Transaction,
	categoryName: string | null,
): DisplayTransaction {
	const isExpense = tx.type === "EXPENSE" || tx.type === "TRANSFER_OUT";
	const amount = isExpense ? -Math.abs(tx.amount) : Math.abs(tx.amount);

	const d = new Date(tx.date);
	const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
	const day = String(d.getDate()).padStart(2, "0");

	return {
		id: tx.id,
		date: `${month} ${day}`,
		name: tx.description || tx.type,
		cat: categoryName || tx.type,
		amount,
		status: "cleared",
	};
}

export function toDisplayBudgetLine(line: BudgetLineSummary): DisplayBudget {
	const pct = line.planned > 0 ? line.spent / line.planned : 0;
	const tone: DisplayBudget["tone"] = pct > 1 ? "loss" : pct > 0.8 ? "warn" : "accent";

	return {
		cat: line.categoryName,
		spent: line.spent,
		cap: line.planned,
		tone,
	};
}

export function toDisplayGoal(goal: SavingsGoal): DisplayGoal {
	const pct = goal.targetAmount > 0 ? goal.currentAmount / goal.targetAmount : 0;

	let tag = "";
	if (goal.deadline) {
		const d = new Date(goal.deadline);
		tag = d.toLocaleString("en-US", { month: "short", year: "numeric" }).toLowerCase();
	}
	else if (pct >= 0.9) {
		tag = "almost there";
	}
	else {
		tag = `${Math.round(pct * 100)}% saved`;
	}

	return {
		id: goal.id,
		name: goal.name,
		saved: goal.currentAmount,
		target: goal.targetAmount,
		currency: goal.currency,
		tone: pct > 0.8 ? "warn" : "accent",
		tag,
	};
}
