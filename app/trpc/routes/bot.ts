import type { TRPCRouterRecord } from "@trpc/server";
import { publicProcedure } from "../utils";
import {z} from 'zod'

export const botRouter = {
    getUserData: publicProcedure.input(z.object({telegramId: z.bigint()})).query(async ({ctx, input}) => {
        const {telegramId} = input;
        return await ctx.db.user.findUnique({
            where: {telegramId},
            select: {
                id: true,
                balance: true,
                walletBalance: true,
                publicKey: true,
            }
        });
    })
} satisfies TRPCRouterRecord