import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { userSchema } from "~/db/zod";
import { walletManager } from "~/lib/solana";
import { protectedProcedure } from "../utils";

export const userRouter = {
	getUser: protectedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),
	getUserSolBalance: protectedProcedure.query(async ({ ctx }) => {
		const balance = await walletManager.getUserBalance(ctx.user.id);
		const savedBalance = await ctx.db.user.update({
			where: { id: ctx.user.id },
			data: { walletBalance: balance },
		});
		return savedBalance.walletBalance;
	}),
	getUserMnemonic: protectedProcedure.query(async ({ ctx }) => {
		return walletManager.getUserMnemonic(ctx.user.id);
	}),
	getUserBoosters: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.userBooster.findMany({
			where: { userId: ctx.user.id },
		});
	}),
	getUserTransactions: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.transaction.findMany({
			where: { userId: ctx.user.id },
		});
	}),
	updateUser: protectedProcedure
		.input(userSchema.partial())
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db.user.update({ where: { id: ctx.user.id }, data: input });
				return { success: true, message: "User updated successfully" };
			} catch (error) {
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
				return {
					error:
						error instanceof Error ? error.message : "Something went wrong",
				};
			}
		}),
	payBySolBalance: protectedProcedure
		.input(z.object({ amount: z.number() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const { amount } = input;
				const balance = await walletManager.getUserBalance(ctx.user.id);
				if (balance < amount) {
					return {
						error: "Insufficient SOL balance",
					};
				}
				await walletManager.sendSolFromUser(ctx.user.id, amount);
				return { success: true, message: "Payment successful" };
			} catch (error) {
				return {
					error:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		}),
} satisfies TRPCRouterRecord;
