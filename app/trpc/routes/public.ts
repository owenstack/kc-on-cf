import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../utils";

export const publicRouter = {
	hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
		console.log("Entering hello procedure with input:", input);
		try {
			return `Hello ${input ?? "World"}!`;
		} catch (error) {
			console.error("Error in hello procedure:", error);
			throw error;
		}
	}),
	goodbye: publicProcedure.input(z.string().nullish()).query(({ input }) => {
		console.log("Entering goodbye procedure with input:", input);
		try {
			return `Goodbye ${input ?? "World"}!`;
		} catch (error) {
			console.error("Error in goodbye procedure:", error);
			throw error;
		}
	}),
} satisfies TRPCRouterRecord;