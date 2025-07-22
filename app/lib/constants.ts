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

export const welcomeMessage = (balance: number) =>
	`🚀 Welcome to Galaxy MEV Bot \- Your Edge in Crypto Trading\!

Information about Galaxy MEV Bot:
\- 🔎 Monitors the Solana Blockchain to Identify profitable opportunities\.
\- ⚡️ Automatically executes front run and back run transactions\.
\- 📈 Real\-time profit tracking and visualization\.
\- ☎️ 24/7 Support if you ever encounter any issues [Galaxy Support](https://t\.me/@GalaxyMEVSupport)\.
\- 🤝 Fair 85/15 profit split
\- 💵 No time lock on Withdrawals\.

Start maximizing profits with:

\- ✅ AI\-Powered Strategies: Outsmart the market with precision\.
\- ✅ Lightning\-Fast Execution: Front run trades in milliseconds\. 
\- ✅ Proven Results: Join traders earning 5\-figures monthly [Galaxy Channel](https://t\.me/Galaxy\_MEV\_comm)\.

To activate this bot, ensure your wallet has at least 3\.5  SOL\. 

\- 💰 Average Trade Profit: \~1 to 7\+ SOL
\- 💼 Pro Tip: Scale your profits even more by activating Boosters\.

*Balance: ${balance} SOL*`;