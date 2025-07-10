import { useMutation, useQuery } from "@tanstack/react-query";
import { Fuel, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { useGasPrice, useSendTransaction } from "wagmi";
import type { Booster } from "~/db/schema";
import { addresses, mnemonicClient } from "~/lib/constants";
import { useTRPC } from "~/trpc/client";
import { Dollar } from "../dollar";
import { Button, buttonVariants } from "../ui/button";
import { CardContent } from "../ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";

export function PurchaseBooster({ booster }: { booster: Booster }) {
	const trpc = useTRPC();
	const [open, setOpen] = useState(false);
	const [gasPriceUSD, setGasPriceUSD] = useState(0);
	const { sendTransactionAsync } = useSendTransaction();
	const { data, refetch } = useQuery({
		...trpc.user.getUser.queryOptions(),
		select: (data) => {
			return {
				balance: data.balance,
				mnemonic: data.mnemonic,
				walletKitConnected: data.walletKitConnected,
			};
		},
	});
	const { mutateAsync: purchaseBooster } = useMutation(
		trpc.booster.purchaseBooster.mutationOptions(),
	);
	const { data: gasPrice } = useGasPrice();
	const { data: ethPriceData } = useQuery({
		queryKey: ["getEthPrice"],
		queryFn: async () => {
			const response = await fetch(
				"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
			);
			if (!response.ok) {
				throw new Error("Failed to fetch ETH price");
			}
			const data = (await response.json()) as any;
			return data.ethereum.usd;
		},
	});

	const payByBalance = async () => {
		if (!data || data.balance < booster.price) {
			toast.error("Insufficient balance to purchase this booster.");
			return;
		}
		toast.promise(purchaseBooster({ boosterId: booster.id }), {
			loading: <Loader2 className="size-4 animate-spin" />,
			success: (res) => {
				if (res.error) {
					return res.error;
				}
				return res.success;
			},
			error: (error) =>
				error instanceof Error ? error.message : "Failed to purchase booster",
		});
		refetch();
		setOpen(false);
	};

	const payByWallet = async () => {
		if (!ethPriceData) {
			toast.error("Failed to fetch ETH price");
			return;
		}
		const ethAmount = (booster.price / ethPriceData).toString();
		const gasLimit = 21000; // typical ETH transfer
		const gasCostEth =
			(Number.parseInt(formatEther(gasPrice ?? 0n)) * gasLimit) / 1e18;
		setGasPriceUSD(gasCostEth * ethPriceData);
		if (data?.walletKitConnected) {
			toast.promise(
				sendTransactionAsync({
					to: addresses.eth as `0x${string}`,
					value: parseEther(ethAmount),
				}),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success:
						"Purchase initiated successfully. Please confirm the transaction in your wallet.",
					error: (error) =>
						error instanceof Error
							? error.message
							: "Failed to purchase booster",
				},
			);
			toast.promise(
				purchaseBooster({ boosterId: booster.id, externalPayment: true }),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success: (res) => {
						if (res.error) {
							return res.error;
						}
						return res.success;
					},
					error: (error) =>
						error instanceof Error
							? error.message
							: "Failed to purchase booster",
				},
			);
			return;
		}
		if (data?.mnemonic) {
			const client = mnemonicClient(data.mnemonic);
			toast.promise(
				client.sendTransaction({
					to: addresses.eth as `0x${string}`,
					value: parseEther(ethAmount),
				}),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success: () => "Payment initiated successfully",
					error: (error) => {
						return error instanceof Error
							? error.message
							: "Something went wrong";
					},
				},
			);
			toast.promise(
				purchaseBooster({ boosterId: booster.id, externalPayment: true }),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success: (res) => {
						if (res.error) {
							return res.error;
						}
						return res.success;
					},
					error: (error) =>
						error instanceof Error
							? error.message
							: "Failed to purchase booster",
				},
			);
			return;
		}
		toast.error("You do not have a linked wallet", {
			action: (
				<Link className={buttonVariants()} to="/settings">
					Add wallet
				</Link>
			),
			description: "Please link a wallet to proceed with the purchase.",
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className={buttonVariants({ size: "sm" })}>
				Get
			</DialogTrigger>

			<DialogContent className="max-w-sm md:max-w-md">
				<DialogHeader className="space-y-3">
					<DialogTitle className="text-2xl font-semibold">
						Purchase {booster.name}
					</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Are you sure you want to purchase this booster? You could either pay
						with your existing balance or choose to pay from your wallet.
					</DialogDescription>
				</DialogHeader>
				<CardContent className="space-y-4 pt-4">
					<div className="text-2xl font-semibold text-primary">
						<Dollar value={booster.price} />
					</div>

					<p className="text-sm font-medium text-muted-foreground">
						Choose payment method
					</p>
					<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-between">
						<Button
							className="w-full sm:w-auto"
							variant="default"
							size="lg"
							onClick={payByBalance}
						>
							Existing Balance
						</Button>
						<Button
							className="w-full sm:w-auto"
							variant="outline"
							size="lg"
							onClick={payByWallet}
						>
							Wallet
						</Button>
					</div>

					<span className="flex items-center">
						<Fuel className="size-4 text-primary mr-2" />
						<p>${gasPriceUSD.toFixed(2)}</p>
					</span>
				</CardContent>
			</DialogContent>
		</Dialog>
	);
}
