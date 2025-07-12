import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../utils";

export const boosterRouter = {
	getAvailableBoosters: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering getAvailableBoosters procedure");
		try {
			return await ctx.db.booster.findMany();
		} catch (error) {
			console.error("Error in getAvailableBoosters procedure:", error);
			throw error;
		}
	}),
	purchaseBooster: protectedProcedure
		.input(
			z.object({
				externalPayment: z.boolean().default(false).optional(),
				boosterId: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			console.log("Entering purchaseBooster procedure with input:", input);
			const { boosterId, externalPayment } = input;
			const now = Date.now();
			try {
				const dbBooster = await ctx.db.booster.findUnique({
					where: { id: boosterId },
				});
				if (!dbBooster) {
					console.error("Booster not found in purchaseBooster procedure");
					return { error: "Booster does not exist" };
				}
				const expiresAt =
					dbBooster.type === "duration"
						? new Date(now + (dbBooster.duration ?? 0))
						: undefined;
				if (externalPayment) {
					await Promise.all([
						await ctx.db.userBooster.create({
							data: {
								userId: ctx.user.id,
								boosterId,
								activatedAt: new Date(),
								expiresAt: expiresAt ?? null,
							},
						}),
						await ctx.db.transaction.create({
							data: {
								userId: ctx.user.id,
								type: "purchase",
								amount: dbBooster.price,
								status: "success",
								description: `Booster ${dbBooster.name} purchased`,
							},
						}),
					]);
					return { success: true, message: "Booster purchased successfully" };
				}
				await Promise.all([
					await ctx.db.user.update({
						where: { id: ctx.user.id },
						data: { balance: ctx.user.balance - dbBooster.price },
					}),
					await ctx.db.userBooster.create({
						data: {
							userId: ctx.user.id,
							boosterId,
							activatedAt: new Date(),
							expiresAt: new Date(expiresAt ?? now),
						},
					}),
					await ctx.db.transaction.create({
						data: {
							userId: ctx.user.id,
							type: "purchase",
							amount: dbBooster.price,
							status: "success",
							description: `Booster ${dbBooster.name} purchased`,
						},
					}),
				]);
				return { success: true, message: "Booster purchased successfully" };
			} catch (error) {
				console.error("Error in purchaseBooster procedure:", error);
				return {
					error:
						error instanceof Error ? error.message : "Internal server error",
				};
			}
		}),
} satisfies TRPCRouterRecord;