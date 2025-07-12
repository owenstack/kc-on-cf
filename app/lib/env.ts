import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_ALCHEMY_API_KEY: z.string(),
		VITE_APP_TITLE: z.string(),
		VITE_FAMILY_PROJECT_ID: z.string(),
	},
	server: {
		DEV_BOT_TOKEN: z.string(),
		PROD_BOT_TOKEN: z.string(),
		WALLET_SECRET_PHRASE: z.string(),
		DATABASE_URL: z.string().url(),
	},
	runtimeEnv: import.meta.env,
});
