import { adminRouter } from "./routes/admin";
import { boosterRouter } from "./routes/booster";
import { botRouter } from "./routes/bot";
import { liveRouter } from "./routes/live";
import { publicRouter } from "./routes/public";
import { userRouter } from "./routes/user";
import { createTRPCRouter } from "./utils";

export const appRouter = createTRPCRouter({
	public: publicRouter,
	user: userRouter,
	booster: boosterRouter,
	live: liveRouter,
	admin: adminRouter,
	bot: botRouter
});

export type AppRouter = typeof appRouter;
