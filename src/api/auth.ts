import { http } from "./http";
import type { AuthResponse, LoginRequest, SignupRequest } from "./types";

export const authApi = {
	async signup(payload: SignupRequest): Promise<AuthResponse> {
		const { data } = await http.post<AuthResponse>("/auth/signup", payload);
		return data;
	},

	async login(payload: LoginRequest): Promise<AuthResponse> {
		const { data } = await http.post<AuthResponse>("/auth/login", payload);
		return data;
	},
};
