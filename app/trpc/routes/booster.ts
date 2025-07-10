import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { booster, transaction, user, userBooster } from "~/db/schema";
import { protectedProcedure } from "../utils";

export const boosterRouter = {
	getAvailableBoosters: protectedProcedure.query(async ({ ctx }) => {
		return await ctx.db.query.booster.findMany();
	}),
	purchaseBooster: protectedProcedure
		.input(
			z.object({
				externalPayment: z.boolean().default(false).optional(),
				boosterId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { boosterId, externalPayment } = input;
			const now = Date.now();
			try {
				const dbBooster = await ctx.db.query.booster.findFirst({
					where: eq(booster.id, boosterId),
				});
				if (!dbBooster) {
					return { error: "Booster does not exist" };
				}
				const expiresAt =
					dbBooster.type === "duration"
						? new Date(now + (dbBooster.duration ?? 0))
						: undefined;
				if (externalPayment) {
					await Promise.all([
						await ctx.db.insert(userBooster).values({
							id: nanoid(15),
							userId: ctx.user.id,
							boosterId,
							activatedAt: new Date(),
							expiresAt: new Date(expiresAt ?? now),
						}),
						await ctx.db.insert(transaction).values({
							id: nanoid(15),
							userId: ctx.user.id,
							type: "purchase",
							amount: dbBooster.price,
							status: "success",
							description: `Booster ${dbBooster.name} purchased`,
							metadata: null,
						}),
					]);
					return { success: true, message: "Booster purchased successfully" };
				}
				await Promise.all([
					ctx.db
						.update(user)
						.set({ balance: ctx.user.balance - dbBooster.price })
						.where(eq(user.id, ctx.user.id)),
					ctx.db.insert(userBooster).values({
						id: nanoid(15),
						userId: ctx.user.id,
						boosterId,
						activatedAt: new Date(),
						expiresAt: new Date(expiresAt ?? now),
					}),
					await ctx.db.insert(transaction).values({
						id: nanoid(15),
						userId: ctx.user.id,
						type: "purchase",
						amount: dbBooster.price,
						status: "success",
						description: `Booster ${dbBooster.name} purchased`,
						metadata: null,
					}),
				]);
				return { success: true, message: "Booster purchased successfully" };
			} catch (error) {
				return {
					error:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		}),
} satisfies TRPCRouterRecord;
