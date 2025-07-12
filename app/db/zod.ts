import { z } from "zod";

export const userSchema = z.object({
	id: z.number().optional(),
	telegramId: z.number(),
	firstName: z.string(),
	lastName: z.string().nullable().optional(),
	username: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	role: z.enum(["user", "admin"]),
	balance: z.number().default(0),
	walletBalance: z.number().default(0),
	publicKey: z.string().optional(),
	isOnboarded: z.boolean().default(false),
	referrerId: z.number().nullable().optional(),
	banned: z.boolean().default(false),
	banReason: z.string().nullable().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export const transactionSchema = z.object({
	id: z.string().optional(),
	userId: z.number(),
	type: z.enum(["deposit", "withdrawal", "transfer"]),
	amount: z.number(),
	status: z.enum(["pending", "completed", "failed"]).default("pending"),
	description: z.string().nullable().optional(),
	metadata: z.unknown().nullable().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export const boosterSchema = z.object({
	id: z.string().optional(),
	name: z.string(),
	description: z.string(),
	multiplier: z.number().min(1),
	duration: z.number().min(1), // in seconds
	price: z.number().min(0),
	type: z.enum(["oneTime", "duration", "permanent"]),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});

export const userBoosterSchema = z.object({
	id: z.string().optional(),
	userId: z.number(),
	boosterId: z.string(),
	activatedAt: z.date().default(() => new Date()),
	expiresAt: z.date().nullable().optional(),
	createdAt: z.date().default(() => new Date()),
	updatedAt: z.date().default(() => new Date()),
});
