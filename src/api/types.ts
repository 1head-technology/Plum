// Domain types mirroring the Prostamol REST API contract.
// Kept as plain types so they can be reused across stores, components and tests.

export type UUID = string;
export type ISODate = string; // YYYY-MM-DD

// Types enums

export type AccountType =
	| "CHECKING"
	| "SAVINGS"
	| "CREDIT_CARD"
	| "CASH"
	| "INVESTMENT"
	| "BANK_ACCOUNT";

export type TransactionType =
	| "INCOME"
	| "EXPENSE"
	| "TRANSFER_OUT"
	| "TRANSFER_IN";

export type RecurrenceFrequency =
	| "DAILY"
	| "WEEKLY"
	| "MONTHLY"
	| "YEARLY";

export type CategoryType = "INCOME" | "EXPENSE";

export type BudgetStatus = "ACTIVE" | "CLOSED";

export type SavingsGoalStatus = "ACTIVE" | "ACHIEVED" | "CANCELLED";

// Entity interfaces

export interface User {
	id: UUID;
	email: string;
	name: string;
	defaultCurrency: string;
}

export interface Account {
	id: UUID;
	userId: UUID;
	name: string;
	type: AccountType;
	initialBalance: number;
	currency: string;
}

export interface AccountBalance {
	accountId: UUID;
	balance: number;
	currency: string;
}

export interface Transaction {
	id: UUID;
	userId: UUID;
	accountId: UUID;
	type: TransactionType;
	amount: number;
	currency: string;
	date: ISODate;
	description: string | null;
	categoryId: UUID | null;
	linkedTransactionId: UUID | null;
	recurring: boolean;
	recurrenceFrequency: RecurrenceFrequency | null;
}

export interface Category {
	id: UUID;
	userId: UUID | null;
	name: string;
	type: CategoryType;
	system: boolean;
}

export interface BudgetLine {
	id: UUID;
	categoryId: UUID;
	plannedAmount: number;
	currency: string;
}

export interface Budget {
	id: UUID;
	userId: UUID;
	name: string;
	from: ISODate;
	to: ISODate;
	status: BudgetStatus;
	lines: BudgetLine[];
}

export interface BudgetLineSummary {
	categoryId: UUID;
	categoryName: string;
	planned: number;
	spent: number;
	remaining: number;
	currency: string;
}

export interface BudgetSummary {
	budgetId: UUID;
	budgetName: string;
	lines: BudgetLineSummary[];
}

export interface SavingsGoal {
	id: UUID;
	userId: UUID;
	name: string;
	targetAmount: number;
	currentAmount: number;
	currency: string;
	deadline: ISODate | null;
	status: SavingsGoalStatus;
}

// Requests interfaces

export interface SignupRequest {
	name: string;
	email: string;
	password: string;
	defaultCurrency: string;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface AuthResponse {
	user: User;
	token: string;
}

export interface CreateAccountRequest {
	name: string;
	type: AccountType;
	initialBalance: number;
	currency: string;
}

export interface RecordTransactionRequest {
	accountId: UUID;
	type: TransactionType;
	amount: number;
	currency: string;
	date: ISODate;
	description?: string;
	categoryId?: UUID;
	recurring: boolean;
	recurrenceFrequency?: RecurrenceFrequency | null;
}

export interface RecordTransferRequest {
	sourceAccountId: UUID;
	destinationAccountId: UUID;
	amount: number;
	currency: string;
	date: ISODate;
	description?: string;
}

export interface CreateCategoryRequest {
	name: string;
	type: CategoryType;
}

export interface CreateBudgetLineRequest {
	categoryId: UUID;
	plannedAmount: number;
	currency: string;
}

export interface CreateBudgetRequest {
	name: string;
	from: ISODate;
	to: ISODate;
	lines: CreateBudgetLineRequest[];
}

export interface CreateSavingsGoalRequest {
	name: string;
	targetAmount: number;
	currency: string;
	deadline?: ISODate;
}

export interface AddContributionRequest {
	amount: number;
	currency: string;
}

// Error interface

export interface ApiError {
	status: number;
	error: string;
	message: string;
	timestamp: string;
}
