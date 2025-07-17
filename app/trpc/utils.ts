import {
	AuthDateInvalidError,
	ExpiredError,
	parse,
	SignatureInvalidError,
	SignatureMissingError,
	validate,
} from "@telegram-apps/init-data-node";
import { initTRPC, TRPCError } from "@trpc/server";
import type { LoaderFunctionArgs } from "react-router";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "~/db";
import { serverEnv } from "~/lib/env.server";
import { walletManager } from "~/lib/solana";
import { nanoid } from "nanoid";
import { token } from "~/lib/constants";

export async function createContext({ headers }: { headers: Headers }) {
	try {
		const authHeader = headers.get("Authorization") ?? "";
		const [authType, authData = ""] = authHeader.split(" ");
		if (authType !== "tma") {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid authentication type",
			});
		}
		if (process.env.NODE_ENV !== 'development') {
			validate(authData, token, {
				expiresIn: 3600,
			});
		}
		const initData = parse(authData);
		if (!initData || !initData.user) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid authentication data",
			});
		}
		const existingUser = await db.user.findUnique({
			where: { telegramId: BigInt(initData.user.id) },
		});
		if (existingUser) {
			const updatedUser = await db.user.update({
				where: { telegramId: BigInt(initData.user.id) },
				data: {
					firstName: initData.user.first_name,
					lastName: initData.user.last_name || null,
					username: initData.user.username || null,
					image: initData.user.photo_url || null,
				},
			});
			return { user: updatedUser, db };
		}
		const userId = nanoid(15);
		const { publicKey } = walletManager.createUserWallet(userId);
		const newUser = await db.user.create({
			data: {
				id: userId,
				telegramId: BigInt(initData.user.id),
				firstName: initData.user.first_name,
				lastName: initData.user.last_name || null,
				username: initData.user.username || null,
				image: initData.user.photo_url || null,
				publicKey,
				role: "user",
				balance: 0,
			},
		});
		return { user: newUser, db };
	} catch (error) {
		if (error instanceof ExpiredError) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Authentication data has expired",
			});
		}
		if (error instanceof AuthDateInvalidError) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid auth date in authentication data",
			});
		}
		if (error instanceof SignatureInvalidError) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Invalid signature in authentication data",
			});
		}
		if (error instanceof SignatureMissingError) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Signature is missing in authentication data",
			});
		}
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: error instanceof Error ? error.message : "Unknown error",
		});
	}
}
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter: ({ shape, error }) => ({
		...shape,
		data: {
			...shape.data,
			zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
		},
	}),
});

// Create a caller factory for making server-side tRPC calls from loaders or actions.
export const createCallerFactory = t.createCallerFactory;

// Utility for creating a tRPC router
export const createTRPCRouter = t.router;

// Utility for a public procedure (doesn't require an authenticated user)
export const publicProcedure = t.procedure;

// Create a utility function for protected tRPC procedures that require an authenticated user.
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user?.id) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}
	return next({
		ctx: {
			user: ctx.user,
		},
	});
});

export const adminProcedure = t.procedure.use(({ ctx, next }) => {
	if (!ctx.user?.role || ctx.user.role !== "admin") {
		throw new TRPCError({ code: "FORBIDDEN" });
	}
	return next({
		ctx: {
			user: ctx.user,
		},
	});
});

export const caller = async ({ request }: LoaderFunctionArgs) => {
	const { appRouter } = await import("./router");
	const createCaller = createCallerFactory(appRouter);
	return createCaller(await createContext({ headers: request.headers }));
};

export async function createBotContext(telegramUser: {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}) {
	const telegramId = BigInt(telegramUser.id);
  let user = await db.user.findUnique({ where: { telegramId } });
  if (!user) {
    const userId = nanoid(15);
    const { publicKey } = walletManager.createUserWallet(userId);
    user = await db.user.create({
      data: {
        id: userId,
        telegramId,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        username: telegramUser.username ?? null,
        image: telegramUser.photo_url ?? null,
        publicKey,
        role: "user",
        balance: 0,
      },
    });
	return {user, db}
}
user = await db.user.update({
      where: { telegramId },
      data: {
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name ?? null,
        username: telegramUser.username ?? null,
        image: telegramUser.photo_url ?? null,
      },
    });
  return { user, db };
}

export async function botCaller(telegramUser: Parameters<typeof createBotContext>[0]) {
  const ctx = await createBotContext(telegramUser);
  const { appRouter } = await import("./router");
  const createBotCaller = createCallerFactory(appRouter);
  return createBotCaller(ctx);
}