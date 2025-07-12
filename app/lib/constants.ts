import type { User } from "generated/prisma";
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

export interface BoosterOverview {
	analytics: {
		activeUsers: number;
		totalPurchases: number;
		uniqueUsers: number;
		revenue: number;
		avgDurationMs: number;
		avgDurationDays: number;
		purchaseFrequency: number;
		activeUsersPercentage: number;
	};
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	type: "oneTime" | "permanent" | "duration";
	description: string;
	price: number;
	userBoosters: {
		user: User;
		id: string;
		userId: number;
		boosterId: string;
		activatedAt: Date;
		expiresAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}[];
}
