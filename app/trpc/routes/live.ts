import type { TRPCRouterRecord } from "@trpc/server";
import type { DataPoint } from "~/lib/constants";
import { protectedProcedure } from "../utils";

const MEV_CONFIG = {
	BASE_MIN: 0.01,
	BASE_MAX: 0.05,
	SPIKE_CHANCE: 0.05,
	SPIKE_MIN: 0.1,
	SPIKE_MAX: 1,
};

const MULTIPLIERS = {
	MAX_TIME_BASED: 0.3,
	TIME_GROWTH_RATE: 0.02,
};

export const liveRouter = {
	mevData: protectedProcedure.query(async ({ ctx }) => {
		console.log("Entering mevData procedure");
		try {
			const { BASE_MAX, BASE_MIN, SPIKE_CHANCE, SPIKE_MAX, SPIKE_MIN } =
				MEV_CONFIG;
			const points: DataPoint[] = [];
			const count = 100;
			const startTime = Date.now() - count * 1000;
			const accountAgeInWeeks =
				(Date.now() - ctx.user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 7);
			const timeMultplier = Math.max(
				0,
				Math.min(
					accountAgeInWeeks * MULTIPLIERS.TIME_GROWTH_RATE,
					MULTIPLIERS.MAX_TIME_BASED,
				),
			);
			const timeBonus = 1 + timeMultplier;
			for (let i = 0; i < count; i++) {
				const isSpike = Math.random() < SPIKE_CHANCE;
				const min = isSpike ? SPIKE_MIN : BASE_MIN;
				const max = isSpike ? SPIKE_MAX : BASE_MAX;
				const baseValue = min + Math.random() + (max - min);
				const value = baseValue * timeBonus;
				const timestamp = startTime + i * 1000;
				await ctx.db.user.update({
					where: { id: ctx.user.id },
					data: { balance: ctx.user.balance + value },
				});
				points.push({
					timestamp,
					value,
				});
			}
			return points;
		} catch (error) {
			console.error("Error in mevData procedure:", error);
			throw error;
		}
	}),
} satisfies TRPCRouterRecord;