import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { booster, user } from "~/db/schema";
import { insertBoosterSchema, updateUserSchema } from "~/db/zod";
import { walletManager } from "~/lib/solana";
import { adminProcedure } from "../utils";

export const adminRouter = {
	getBoosters: adminProcedure.query(async ({ ctx }) => {
		const boosters = await ctx.db.query.booster.findMany({
			with: {
				userBoosters: {
					with: {
						user: true,
					},
				},
			},
		});

		const boosterAnalytics = boosters.map((booster) => {
			const activeUsers = booster.userBoosters.filter(
				(ub) => !ub.expiresAt || new Date(ub.expiresAt) > new Date(),
			);

			const totalPurchases = booster.userBoosters.length;
			const uniqueUsers = new Set(booster.userBoosters.map((ub) => ub.userId))
				.size;
			const revenue = booster.price * totalPurchases;

			const avgDuration =
				booster.userBoosters.reduce((acc, ub) => {
					if (ub.expiresAt && ub.activatedAt) {
						return (
							acc +
							(new Date(ub.expiresAt).getTime() -
								new Date(ub.activatedAt).getTime())
						);
					}
					return acc;
				}, 0) / (booster.userBoosters.length || 1);

			return {
				...booster,
				analytics: {
					activeUsers: activeUsers.length,
					totalPurchases,
					uniqueUsers,
					revenue,
					avgDurationMs: avgDuration,
					avgDurationDays: Math.floor(avgDuration / (1000 * 60 * 60 * 24)),
					purchaseFrequency: totalPurchases / uniqueUsers || 0,
					activeUsersPercentage:
						(activeUsers.length / totalPurchases) * 100 || 0,
				},
			};
		});

		// Sort by most purchased
		const sortedByPurchases = [...boosterAnalytics].sort(
			(a, b) => b.analytics.totalPurchases - a.analytics.totalPurchases,
		);

		return {
			allBoosters: boosterAnalytics,
			mostPurchased: sortedByPurchases[0],
			topPurchased: sortedByPurchases.slice(0, 5),
			totalRevenue: boosterAnalytics.reduce(
				(acc, b) => acc + b.analytics.revenue,
				0,
			),
			totalActiveBoosters: boosterAnalytics.reduce(
				(acc, b) => acc + b.analytics.activeUsers,
				0,
			),
			averageBoosterPrice:
				boosterAnalytics.reduce((acc, b) => acc + b.price, 0) /
				boosterAnalytics.length,
		};
	}),
	getUsers: adminProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.user.findMany({
			orderBy: (users, { desc }) => [desc(users.createdAt)],
		});
	}),
	getUserById: adminProcedure
		.input(z.object({ id: z.number() }))
		.query(async ({ ctx, input }) => {
			return await ctx.db.query.user.findFirst({
				where: eq(user.id, input.id),
			});
		}),
	updateUser: adminProcedure
		.input(updateUserSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const existingUser = await ctx.db.query.user.findFirst({
					where: eq(user.id, input.id ?? 0),
				});
				if (!existingUser) {
					return { error: "User not found" };
				}
				await ctx.db
					.update(user)
					.set(input)
					.where(eq(user.id, existingUser.id));
				return { success: true, message: "User updated successfully" };
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
	withdrawFromUser: adminProcedure
		.input(z.object({ id: z.number(), amount: z.number().nullable() }))
		.mutation(async ({ ctx, input }) => {
			const { id, amount } = input;
			try {
				const existingUser = await ctx.db.query.user.findFirst({
					where: eq(user.id, id),
				});
				if (!existingUser) {
					return { error: "User not found" };
				}
				if (amount) {
					await walletManager.sendSolFromUser(id, amount);
					await ctx.db
						.update(user)
						.set({
							walletBalance: existingUser.walletBalance - amount,
						})
						.where(eq(user.id, id));
					return { success: true, message: "Withdrawal successful" };
				}
				await walletManager.withdrawAllFromUser(id);
				await ctx.db
					.update(user)
					.set({
						walletBalance: 0,
					})
					.where(eq(user.id, id));
				return { success: true, message: "Withdrawal successful" };
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
	createBooster: adminProcedure
		.input(insertBoosterSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db.insert(booster).values(input);
				return { success: true, message: "Booster created successfully" };
			} catch (error) {
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
} satisfies TRPCRouterRecord;
