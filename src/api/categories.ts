import { http } from "./http";
import type { Category, CreateCategoryRequest } from "./types";

export const categoriesApi = {
	async create(payload: CreateCategoryRequest): Promise<Category> {
		const { data } = await http.post<Category>("/categories", payload);
		return data;
	},

	async list(): Promise<Category[]> {
		const { data } = await http.get<Category[]>("/categories");
		return data;
	},
};
