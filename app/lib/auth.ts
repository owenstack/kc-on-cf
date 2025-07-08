import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP } from "better-auth/plugins";
import { db } from "~/db";
import { client } from "~/trpc/client";

export const auth = betterAuth({
	appName: "VeriFind",
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		// async sendResetPassword({ user, token }) {
		// 	await client.resetPasswordMail.mutate({ email: user.email, token });
		// },
	},
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	user: {
		additionalFields: {
			onboarded: {
				type: "boolean",
				default: false,
				input: true,
			},
			mode: {
				type: "string",
				input: true,
			},
		},
	},
	plugins: [
		admin(),
		// emailOTP({
		// 	async sendVerificationOTP({ email, otp, type }) {
		// 		if (type === "email-verification") {
		// 			await client.verificationMail.mutate({ email, token: otp });
		// 		}
		// 		if (type === "forget-password") {
		// 			await client.resetPasswordMail.mutate({ email, token: otp });
		// 		}
		// 	},
		// }),
	],
});
