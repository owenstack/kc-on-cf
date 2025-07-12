import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { userSchema } from "~/db/zod";
import { walletManager } from "~/lib/solana";
import { protectedProcedure } from "../utils";

export const userRouter = {
	getUser: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering getUser procedure");
		try {
			return ctx.user;
		} catch (error) {
			console.error("Error in getUser procedure:", error);
			throw error;
		}
	}),
	getUserSolBalance: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering getUserSolBalance procedure");
		try {
			const balance = await walletManager.getUserBalance(ctx.user.id);
			const savedBalance = await ctx.db.user.update({
				where: { id: ctx.user.id },
				data: { walletBalance: balance },
			});
			return savedBalance.walletBalance;
		} catch (error) {
			console.error("Error in getUserSolBalance procedure:", error);
			throw error;
		}
	}),
	getUserMnemonic: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering getUserMnemonic procedure");
		try {
			return walletManager.getUserMnemonic(ctx.user.id);
		} catch (error) {
			console.error("Error in getUserMnemonic procedure:", error);
			throw error;
		}
	}),
	getUserBoosters: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering getUserBoosters procedure");
		try {
			return await ctx.db.userBooster.findMany({
				where: { userId: ctx.user.id },
			});
		} catch (error) {
			console.error("Error in getUserBoosters procedure:", error);
			throw error;
		}
	}),
	getUserTransactions: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering getUserTransactions procedure");
		try {
			return await ctx.db.transaction.findMany({
				where: { userId: ctx.user.id },
			});
		} catch (error) {
			console.error("Error in getUserTransactions procedure:", error);
			throw error;
		}
	}),
	updateUser: protectedProcedure
		.input(userSchema.partial())
		.mutation(async ({ ctx, input }) => {
			console.log("Entering updateUser procedure with input:", input);
			try {
				await ctx.db.user.update({ where: { id: ctx.user.id }, data: input });
				return { success: true, message: "User updated successfully" };
			} catch (error) {
				console.error("Error in updateUser procedure:", error);
				return {
					error:
						error instanceof Error ? error.message : "Something went wrong",
				};
			}
		}),
	createTransaction: protectedProcedure
		.input(
			z.object({
				type: z.enum(["withdrawal", "deposit", "transfer"]),
				amount: z.number(),
				metadata: z.unknown().optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log("Entering createTransaction procedure with input:", input);
			try {
				const { type, amount, description } = input;
				await ctx.db.transaction.create({
					data: {
						userId: ctx.user.id,
						type,
						amount,
						status: "pending",
						description: description,
					},
				});
				return {
					success: true,
					message: "Transaction initialized successfully",
				};
			} catch (error) {
				console.error("Error in createTransaction procedure:", error);
				return {
					error:
						error instanceof Error ? error.message : "Something went wrong",
				};
			}
		}),
	payBySolBalance: protectedProcedure
		.input(z.object({ amount: z.number() }))
		.mutation(async ({ ctx, input }) => {
			console.log("Entering payBySolBalance procedure with input:", input);
			try {
				const { amount } = input;
				const balance = await walletManager.getUserBalance(ctx.user.id);
				if (balance < amount) {
					console.error("Insufficient SOL balance in payBySolBalance procedure");
					return {
						error: "Insufficient SOL balance",
					};
				}
				await walletManager.sendSolFromUser(ctx.user.id, amount);
				return { success: true, message: "Payment successful" };
			} catch (error) {
				console.error("Error in payBySolBalance procedure:", error);
				return {
					error:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		}),
} satisfies TRPCRouterRecord;