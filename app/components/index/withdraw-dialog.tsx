import { useMutation, useQuery } from "@tanstack/react-query";
import { BatteryWarning, Fuel, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { formatEther, parseEther } from "viem";
import { useAccount, useGasPrice, useSendTransaction } from "wagmi";
import { Button, buttonVariants } from "~/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "~/components/ui/drawer";
import { addresses, mnemonicClient } from "~/lib/constants";
import { useTRPC } from "~/trpc/client";
import { Dollar } from "../dollar";
import { CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function Withdraw() {
	const trpc = useTRPC();
	const { data: user, refetch } = useQuery(trpc.user.getUser.queryOptions());
	const { data: plan } = useQuery(trpc.user.getUserPlan.queryOptions());
	const { mutateAsync: withdraw } = useMutation(
		trpc.user.updateUser.mutationOptions(),
	);
	const { mutateAsync: createTransaction } = useMutation(
		trpc.user.createTransaction.mutationOptions(),
	);
	const { address } = useAccount();
	const { sendTransactionAsync } = useSendTransaction();
	const [amount, setAmount] = useState(0);
	const { data: gasPrice } = useGasPrice();
	const [feePaid, setFeePaid] = useState(false);
	const [gasPriceUSD, setGasPriceUSD] = useState(0);
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
	const getWithdrawalLimits = () => {
		switch (plan?.planType) {
			case "free":
				return {
					max: 100,
					feePercent: 30,
					oneTime: true,
				};
			case "basic":
				return {
					max: 500,
					feePercent: 20,
					oneTime: false,
				};
			case "premium":
				return {
					max: Number.POSITIVE_INFINITY,
					feePercent: 10,
					oneTime: false,
				};
			default:
				return {
					max: 100,
					feePercent: 30,
					oneTime: true,
				};
		}
	};
	const handlePayFee = async () => {
		if (!ethPriceData) {
			toast.error("Failed to fetch ETH price");
			return;
		}
		const ethAmount = (feeAmount / ethPriceData).toString();
		const gasLimit = 21000; // typical ETH transfer
		const gasCostEth =
			(Number.parseInt(formatEther(gasPrice ?? 0n)) * gasLimit) / 1e18;
		setGasPriceUSD(gasCostEth * ethPriceData);
		if (user?.walletKitConnected) {
			toast.promise(
				sendTransactionAsync({
					to: addresses.eth as `0x${string}`,
					value: parseEther(ethAmount),
				}),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success: () => {
						setFeePaid(true);
						return "Fee paid successfully";
					},
					error: (error) =>
						error instanceof Error ? error.message : "Something went wrong",
				},
			);
			return;
		}
		if (user?.mnemonic) {
			const client = mnemonicClient(user.mnemonic);
			toast.promise(
				client.sendTransaction({
					to: addresses.eth as `0x${string}`,
					value: parseEther(ethAmount),
				}),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success: () => {
						setFeePaid(true);
						return "Payment complete!";
					},
					error: (error) => {
						return error instanceof Error
							? error.message
							: "Something went wrong";
					},
				},
			);
			return;
		}
		toast.error("Something went wrong", {
			action: (
				<Link className={buttonVariants()} to="/settings">
					Add wallet
				</Link>
			),
			description: "You do not have a linked wallet",
		});
	};

	const handleWithdraw = async () => {
		if (amount < 100) {
			toast.error("Minimum withdrawal amount is $100");
			return;
		}
		if (amount > limits.max) {
			toast.error(`Maximum withdrawal amount is ${limits.max}`);
			return;
		}
		if (!feePaid) {
			toast.error("Please pay the fee first");
			return;
		}
		toast.promise(withdraw({ balance: user?.balance ?? 0 - amount }), {
			loading: <Loader2 className="size-4 animate-spin" />,
			success: (res) => {
				if (res.error) {
					return res.error;
				}
				return res.message;
			},
			error: (error) =>
				error instanceof Error ? error.message : "Something went wrong",
		});

		toast.promise(
			createTransaction({
				type: "withdrawal",
				amount,
			}),
			{
				loading: <Loader2 className="size-4 animate-spin" />,
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					return res.message;
				},
				error: (error) =>
					error instanceof Error ? error.message : "Something went wrong",
			},
		);
		refetch();
	};

	const limits = getWithdrawalLimits();
	const feeAmount = (amount * limits.feePercent) / 100;

	return (
		<Drawer>
			<DrawerTrigger className={buttonVariants()}>Withdraw</DrawerTrigger>
			<DrawerContent className="px-4">
				<DrawerHeader>
					<DrawerTitle>Withdraw Funds</DrawerTitle>
					<DrawerDescription>
						Free plan allows one-time withdrawal up to $100 with 30% fee
					</DrawerDescription>
				</DrawerHeader>
				<CardContent className="grid gap-4">
					<div className="flex flex-col gap-2">
						<Label>Available Balance</Label>
						<div className="text-2xl font-semibold">
							<Dollar value={user?.balance ?? 0} />
						</div>
					</div>
					{!user?.mnemonic && !address ? (
						<div className="flex flex-col items-center gap-2">
							<BatteryWarning className="size-8 text-destructive" />
							<p>You haven't connected any wallets yet</p>
							<Link
								className={buttonVariants({ variant: "outline" })}
								to="/settings"
							>
								Add wallet
							</Link>
						</div>
					) : (
						<>
							<div className="flex flex-col gap-2">
								<Label>Withdrawal Amount</Label>
								<Input
									type="number"
									min={100}
									max={limits.max}
									value={amount}
									onChange={(e) => setAmount(Number(e.target.value))}
									placeholder="Enter amount to withdraw"
								/>
							</div>

							{amount >= 100 && (
								<div className="flex flex-col gap-2">
									<Label>Fee Required</Label>
									<div className="flex items-center justify-between">
										<span>
											{limits.feePercent}% (${feeAmount})
										</span>
										<span className="flex items-center">
											<Fuel className="size-4 text-primary mr-2" />
											<p>${gasPriceUSD.toFixed(2)}</p>
										</span>
										<Button
											variant="outline"
											disabled={feePaid}
											onClick={handlePayFee}
										>
											{feePaid ? "Fee Paid" : "Pay Fee"}
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</CardContent>
				<DrawerFooter>
					<Button onClick={handleWithdraw} disabled={!feePaid || amount < 100}>
						Confirm Withdrawal
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
