import { publicRouter } from "./routes/public";
import { createTRPCRouter } from "./utils";

export const appRouter = createTRPCRouter({
	public: publicRouter,
});

export type AppRouter = typeof appRouter;
