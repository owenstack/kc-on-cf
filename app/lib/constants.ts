import type { ReactNode } from "react";
import { createWalletClient, http } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import "viem/window";

export const mnemonicClient = (mnemonic: string) => {
	return createWalletClient({
		account: mnemonicToAccount(mnemonic),
		chain: mainnet,
		transport: http(
			`https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
		),
	});
};

export const withdrawBalance = (
	balance: number,
	plan: "free" | "premium" | "basic",
) => {
	if (!balance) return false;

	const thresholds = {
		free: 1000,
		basic: 500,
		premium: 350,
	};

	return balance >= thresholds[plan];
};

export const addresses = {
	btc: "bc1qdx9w43hemm866nzta86ts86h7rr5n84p70sfan",
	eth: "0x2ee7A970686CA39Ef006FBFF10bF6310cc37aa50",
};

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
