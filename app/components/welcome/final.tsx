import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import rocket from "~/assets/product-launch.svg";
import { mnemonicClient } from "~/lib/constants";
import { useStepStore } from "~/lib/store";
import { useTRPC } from "~/trpc/client";
import { ConnectKit } from "../cex";
import { Button } from "../ui/button";

export function FinalStep() {
	const trpc = useTRPC();
	const { data: plan } = useQuery(trpc.user.getUserPlan.queryOptions());
	const { data: user } = useQuery(trpc.user.getUser.queryOptions());
	const [mnemonicAddress, setMnemonicAddress] = useState("");
	if (user?.mnemonic) {
		setMnemonicAddress(mnemonicClient(user.mnemonic).account.address);
	}
	const { clearStep } = useStepStore();
	return (
		<main className="flex flex-col items-center gap-4">
			<img
				src={rocket}
				alt="Rocket"
				className="bg-gradient-to-r from-blue-600 via-purple-600 to-black transition-colors max-w-sm rounded-lg"
				style={{
					backgroundSize: "200% 200%",
					animation: "15s ease infinite",
				}}
			/>
			<h3 className="text-pretty text-xl font-semibold">Order Summary</h3>
			<div className=" rounded-lg p-6 shadow-sm space-y-4 min-w-[300px]">
				<div className="text-center mb-4">
					<h4 className="font-medium text-gray-900">Receipt</h4>
					<p className="text-sm text-gray-500">
						{new Date().toLocaleDateString()}
					</p>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between py-2  border-t-2">
						<span className="text-gray-600">Plan</span>
						<span className="font-medium">{plan?.planType}</span>
					</div>

					<div className="flex justify-between py-2  border-t-2">
						<span className="text-gray-600">Wallet</span>
						<span className="font-medium">
							{user?.walletKitConnected ? (
								<ConnectKit />
							) : (
								`${mnemonicAddress.slice(0, 6)}...${mnemonicAddress.slice(-6)}`
							)}
						</span>
					</div>

					<div className="flex justify-between py-2  border-t-2">
						<span className="text-gray-600">Amount</span>
						<span className="font-medium">${plan?.amount}</span>
					</div>
				</div>
			</div>
			<Button
				onClick={() => {
					clearStep();
					window.location.reload();
				}}
			>
				Confirm & Start Mining
			</Button>
		</main>
	);
}
