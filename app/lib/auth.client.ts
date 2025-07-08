import {
	adminClient,
	emailOTPClient,
	inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

const authClient = createAuthClient({
	baseURL: import.meta.env.DEV
		? "http://localhost:5173"
		: "https://app.habilens.com",
	plugins: [
		adminClient(),
		emailOTPClient(),
		inferAdditionalFields<typeof auth>(),
	],
});

export const {
	signIn,
	signUp,
	useSession,
	admin,
	changeEmail,
	changePassword,
	deleteUser,
	verifyEmail,
	forgetPassword,
	getSession,
	signOut,
	updateUser,
	emailOtp,
	resetPassword,
	sendVerificationEmail,
} = authClient;
