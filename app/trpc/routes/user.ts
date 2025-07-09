import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { subscription, transaction, user, userBooster } from "~/db/schema";
import { updateUserSchema } from "~/db/zod";
import { protectedProcedure } from "../utils";

export const userRouter = {
	getUser: protectedProcedure.query(async ({ ctx }) => {
		return ctx.user;
	}),
	getUserPlan: protectedProcedure.query(async ({ ctx }) => {
		const plan = await ctx.db.query.subscription.findFirst({
			where: eq(subscription.userId, ctx.user.id),
			with: {
				plan: true,
			},
		});
		return plan;
	}),
	getUserBoosters: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.userBooster.findMany({
			where: eq(userBooster.userId, ctx.user.id),
		});
	}),
	getUserTransactions: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.transaction.findMany({
			where: eq(transaction.userId, ctx.user.id),
		});
	}),
	getUserSubscription: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.subscription.findMany({
			where: eq(subscription.userId, ctx.user.id),
		});
	}),
	updateUser: protectedProcedure
		.input(updateUserSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const { data, error } = await updateUserSchema.safeParseAsync(input);
				if (error) {
					return {
						error: error instanceof Error ? error.message : "Invalid input",
					};
				}
				await ctx.db.update(user).set(data).where(eq(user.id, ctx.user.id));
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
				const { type, amount, metadata, description } = input;
				await ctx.db.insert(transaction).values({
					id: nanoid(15),
					userId: ctx.user.id,
					type,
					amount,
					status: "pending",
					description,
					metadata,
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
	createUserPlan: protectedProcedure
		.input(
			z.object({
				planType: z.enum(["free", "basic", "premium"]),
				planDuration: z.enum(["yearly", "monthly"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { planType, planDuration } = input;
			try {
				if (planType !== "free") {
				}
				await ctx.db.insert(subscription).values({
					id: nanoid(15),
					userId: ctx.user.id,
					planType,
					planDuration,
					startDate: new Date(),
					endDate:
						planType === "free"
							? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
							: new Date(
									Date.now() +
										(planDuration === "monthly" ? 30 : 365) *
											24 *
											60 *
											60 *
											1000,
								),
				});
				return { success: true, message: "Plan activated successfully" };
			} catch (error) {
				return {
					error:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		}),
} satisfies TRPCRouterRecord;
