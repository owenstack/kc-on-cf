import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";


export const clientEnv = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_APP_TITLE: z.string(),
		VITE_FAMILY_PROJECT_ID: z.string(),
	},
	runtimeEnv: import.meta.env,
});
