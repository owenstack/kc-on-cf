import vault from "~/assets/money-vault.svg";
import { ConnectKit } from "../cex";
import { DexButton } from "../dex";

export function WelcomeWallet() {
	return (
		<main className="flex flex-col items-center gap-4">
			<img
				src={vault}
				alt="Vault"
				className="bg-gradient-to-r from-blue-600 via-purple-600 to-black transition-colors max-w-sm rounded-lg"
				style={{
					backgroundSize: "200% 200%",
					animation: "15s ease infinite",
				}}
			/>
			<p className="text-xl text-pretty px-4">
				Your keys, your coins. We never have access to your funds.
			</p>
			<div className="grid gap-6 mt-6">
				<ConnectKit />
				<DexButton />
			</div>
		</main>
	);
}
