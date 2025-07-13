import {createEnv} from '@t3-oss/env-core'
import {z} from 'zod'

export const serverEnv = createEnv({
    server: {
		DEV_BOT_TOKEN: z.string(),
		PROD_BOT_TOKEN: z.string(),
		WALLET_SECRET_PHRASE: z.string(),
		DATABASE_URL: z.url(),
		ALCHEMY_API_KEY: z.string(),
	},
    runtimeEnv: process.env
})