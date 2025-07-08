import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../utils";

export const publicRouter = {
	hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
		return `Hello ${input ?? "World"}!`;
	}),
	goodbye: publicProcedure.input(z.string().nullish()).query(({ input }) => {
		return `Goodbye ${input ?? "World"}!`;
	}),
} satisfies TRPCRouterRecord;
