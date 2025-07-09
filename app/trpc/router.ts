import { userRouter } from "./routes/user";
import { publicRouter } from "./routes/public";
import { boosterRouter } from "./routes/booster";
import { createTRPCRouter } from "./utils";
import { liveRouter } from "./routes/live";

export const appRouter = createTRPCRouter({
	public: publicRouter,
	user: userRouter,
	booster: boosterRouter,
	live: liveRouter,
});

export type AppRouter = typeof appRouter;
