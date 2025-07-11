import type { ReactNode } from "react";

export interface ButtonProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	children: ReactNode;
}

export interface DataPoint {
	timestamp: number;
	value: number;
}
