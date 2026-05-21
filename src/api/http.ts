import axios, { AxiosError } from "axios";
import type { ApiError } from "./types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const TOKEN_STORAGE_KEY = "plum.token";

export const http = axios.create({
	baseURL,
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
	timeout: 15_000,
});

http.interceptors.request.use((config) => {
	const token = localStorage.getItem(TOKEN_STORAGE_KEY);

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export class ProstamolError extends Error {
	readonly status: number;
	readonly cause?: unknown;

	constructor(status: number, message: string, cause?: unknown) {
		super(message);
		this.name = "ProstamolError";
		this.status = status;
		this.cause = cause;
	}
}

http.interceptors.response.use(
	(response) => response,
	(error: AxiosError<ApiError>) => {
		if (error.response?.data && typeof error.response.data === "object") {
			const data = error.response.data;
			throw new ProstamolError(
				data.status ?? error.response.status,
				data.message ?? error.message,
				error,
			);
		}
		throw new ProstamolError(error.response?.status ?? 0, error.message, error);
	},
);
