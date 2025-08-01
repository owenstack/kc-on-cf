import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { boosterSchema, userSchema } from "~/db/zod";
import { walletManager } from "~/lib/solana";
import { adminProcedure } from "../utils";

export const adminRouter = {
	getBoosters: adminProcedure.query(async ({ ctx }) => {
		console.log("Entering getBoosters procedure");
		try {
			const boosters = await ctx.db.booster.findMany({
				include: { userBoosters: { include: { user: true } } },
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
		} catch (error) {
			console.error("Error in getBoosters procedure:", error);
			throw error;
		}
	}),
	getUsers: adminProcedure.query(async ({ ctx }) => {
		console.log("Entering getUsers procedure");
		try {
			return await ctx.db.user.findMany({ orderBy: { createdAt: "desc" } });
		} catch (error) {
			console.error("Error in getUsers procedure:", error);
			throw error;
		}
	}),
	getUserById: adminProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			console.log("Entering getUserById procedure with input:", input);
			try {
				return await ctx.db.user.findUnique({ where: { id: input.id } });
			} catch (error) {
				console.error("Error in getUserById procedure:", error);
				throw error;
			}
		}),
	updateUser: adminProcedure
		.input(userSchema.partial().extend({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			console.log("Entering updateUser procedure with input:", input);
			try {
				const existingUser = await ctx.db.user.findUnique({
					where: { id: input.id ?? "" },
				});
				if (!existingUser) {
					console.error("User not found in updateUser procedure");
					return { error: "User not found" };
				}
				await ctx.db.user.update({
					where: { id: existingUser.id },
					data: input,
				});
				return { success: true, message: "User updated successfully" };
			} catch (error) {
				console.error("Error in updateUser procedure:", error);
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
	withdrawFromUser: adminProcedure
		.input(z.object({ id: z.string(), amount: z.number().nullable() }))
		.mutation(async ({ ctx, input }) => {
			console.log("Entering withdrawFromUser procedure with input:", input);
			const { id, amount } = input;
			try {
				const existingUser = await ctx.db.user.findUnique({
					where: { id },
				});
				if (!existingUser) {
					console.error("User not found in withdrawFromUser procedure");
					return { error: "User not found" };
				}
				if (amount) {
					await walletManager.sendSolFromUser(id, amount);
					await ctx.db.user.update({
						where: { id },
						data: {
							walletBalance: existingUser.walletBalance - amount,
						},
					});
					return { success: true, message: "Withdrawal successful" };
				}
				await walletManager.withdrawAllFromUser(id);
				await ctx.db.user.update({
					where: { id },
					data: {
						walletBalance: 0,
					},
				});
				return { success: true, message: "Withdrawal successful" };
			} catch (error) {
				console.error("Error in withdrawFromUser procedure:", error);
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
	createBooster: adminProcedure
		.input(boosterSchema)
		.mutation(async ({ ctx, input }) => {
			console.log("Entering createBooster procedure with input:", input);
			try {
				await ctx.db.booster.create({ data: {...input, duration: input.duration * 1000 * 60 * 60 * 24 * 7 } });
				return { success: true, message: "Booster created successfully" };
			} catch (error) {
				console.error("Error in createBooster procedure:", error);
				return {
					error: error instanceof Error ? error.message : "Unknown error",
				};
			}
		}),
	deleteBooster: adminProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
		console.log("Entering deleteBooster procedure with input:", input);
		try {
			const booster = await ctx.db.booster.findUnique({ where: { id: input.id } });
			if (!booster) {
				console.error("Booster not found in deleteBooster procedure");
				return { error: "Booster not found" };
			}
			await ctx.db.booster.delete({ where: { id: input.id } });
			return { success: true, message: "Booster deleted successfully" };
		} catch (error) {
			console.error("Error in deleteBooster procedure:", error);
			return {
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}),
	setPrice: adminProcedure.input(z.object({ value: z.number() })).mutation(async ({ ctx, input }) => {
		const {value} = input;
		try {
			const price = await ctx.db.price.findFirst();
			if (!price) {
				return { error: "Price not found" };
			}
			await ctx.db.price.update({ where: { id: price.id }, data: { value } });
			return { success: true, message: "Price updated successfully" };
		} catch (error) {
			return {error: error instanceof Error ? error.message : "Unknown error"};
		}
	})
} satisfies TRPCRouterRecord;