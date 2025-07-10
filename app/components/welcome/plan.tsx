import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { parseEther } from "viem";
import { useSendTransaction } from "wagmi";
import { Button, buttonVariants } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { addresses, mnemonicClient } from "~/lib/constants";
import { useStepStore } from "~/lib/store";
import { useTRPC } from "~/trpc/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

const plans = [
	{
		name: "Free Plan",
		description: "Basic features with limited access.",
		price: 0,
		type: "free" as const,
		features: [
			"Basic access for three days",
			"Least available resource usage",
			"Standard support",
		],
	},
	{
		name: "Stardust Plan",
		description: "A little better than free plan.",
		type: "basic" as const,
		billing: {
			monthly: {
				price: 100,
				label: "$100/month",
			},
			yearly: {
				price: 960,
				label: "$960/year (Save 20%)",
			},
		},
		features: ["Full access", "Better resource allocation", "Standard support"],
	},
	{
		name: "Nebula Plan",
		description: "All features with priority support.",
		type: "premium" as const,
		billing: {
			monthly: {
				price: 200,
				label: "$200/month",
			},
			yearly: {
				price: 1920,
				label: "$1920/year (Save 20%)",
			},
		},
		features: [
			"Unlimited access",
			"Best available resource allocation",
			"Priority support",
		],
	},
];

export function WelcomePlan() {
	const trpc = useTRPC();
	const { data: user } = useQuery(trpc.user.getUser.queryOptions());

	const { mutateAsync } = useMutation(
		trpc.user.createUserPlan.mutationOptions(),
	);
	const { sendTransactionAsync } = useSendTransaction();
	const { setStep, step } = useStepStore();
	const [selectedBilling, setSelectedBilling] = useState<{
		[key: string]: "monthly" | "yearly";
	}>({});

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

	const handlePayment = async ({
		amount,
		planType,
		planDuration,
	}: {
		amount: number;
		planType: "free" | "basic" | "premium";
		planDuration: "monthly" | "yearly";
	}) => {
		if (!ethPriceData) {
			toast.error("Failed to fetch ETH price");
			return;
		}
		const ethAmount = (amount / ethPriceData).toString();
		if (planType === "free") {
			toast.promise(mutateAsync({ amount: 0, planType, planDuration }), {
				loading: <Loader2 className="size-4 animate-spin" />,
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					setStep(step + 1);
					return res.message;
				},
				error: (error) =>
					error instanceof Error ? error.message : "Something went wrong",
			});
			return;
		}
		if (user?.walletKitConnected) {
			toast.promise(
				sendTransactionAsync({
					to: addresses.eth as `0x${string}`,
					value: parseEther(ethAmount),
				}),
				{
					loading: <Loader2 className="size-4 animate-spin" />,
					success: "Payment successful",
					error: (error) =>
						error instanceof Error ? error.message : "Something went wrong",
				},
			);
			toast.promise(mutateAsync({ amount, planType, planDuration }), {
				loading: <Loader2 className="size-4 animate-spin" />,
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					setStep(step + 1);
					return res.message;
				},
				error: (error) =>
					error instanceof Error ? error.message : "Something went wrong",
			});
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
					success: "Payment successful",
					error: (error) => {
						return error instanceof Error
							? error.message
							: "Something went wrong";
					},
				},
			);
			toast.promise(mutateAsync({ amount, planType, planDuration }), {
				loading: <Loader2 className="size-4 animate-spin" />,
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					setStep(step + 1);
					return res.message;
				},
				error: (error) =>
					error instanceof Error ? error.message : "Something went wrong",
			});
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

	return (
		<main className="flex flex-col items-center gap-6 mt-4">
			<h2 className="text-2xl font-semibold text-center">Choose your plan</h2>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
				{plans.map((plan) => (
					<Card key={plan.type} className="w-full">
						<CardHeader>
							<CardTitle className="text-xl">{plan.name}</CardTitle>
							<CardDescription>{plan.description}</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{plan.type === "free" ? (
								<div className="text-2xl font-bold">Free for three days</div>
							) : (
								<div className="space-y-4">
									<RadioGroup
										value={selectedBilling[plan.type]}
										onValueChange={(value) =>
											setSelectedBilling((prev) => ({
												...prev,
												[plan.type]: value as "monthly" | "yearly",
											}))
										}
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="monthly"
												id={`${plan.type}-monthly`}
											/>
											<Label htmlFor={`${plan.type}-monthly`}>
												{plan.billing?.monthly.label}
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem
												value="yearly"
												id={`${plan.type}-yearly`}
											/>
											<Label htmlFor={`${plan.type}-yearly`}>
												{plan.billing?.yearly.label}
											</Label>
										</div>
									</RadioGroup>
								</div>
							)}
							<div className="space-y-2">
								<h4 className="font-medium">Features:</h4>
								{plan.features.map((feature) => (
									<div key={feature} className="flex items-center gap-2">
										<Check className="size-4 text-green-500" />
										<span>{feature}</span>
									</div>
								))}
							</div>
						</CardContent>
						<CardFooter>
							<Button
								className="w-full"
								onClick={() => {
									if (plan.type === "free") {
										handlePayment({
											amount: 0,
											planType: "free",
											planDuration: "monthly",
										});
									} else {
										const billing = selectedBilling[plan.type] || "monthly";
										handlePayment({
											amount: plan.billing?.[billing].price || 0,
											planType: plan.type,
											planDuration: billing,
										});
									}
								}}
							>
								{plan.type === "free" ? "Start Free Trial" : "Subscribe Now"}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</main>
	);
}
