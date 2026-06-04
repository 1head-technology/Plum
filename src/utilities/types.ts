import type { Component } from "vue";

export interface MenuItem {
	id?: string;
	label?: string;
	icon?: Component;
	shortcut?: string;
	type?: "default" | "danger" | "separator";
}
