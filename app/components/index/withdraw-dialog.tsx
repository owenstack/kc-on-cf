import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { useTRPC } from "~/trpc/client";
import { Dollar } from "../dollar";
import { CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function Withdraw() {
	const trpc = useTRPC();
	const { data: user, refetch, error } = useQuery(trpc.user.getUser.queryOptions());
	const { mutateAsync: withdraw } = useMutation(
		trpc.user.updateUser.mutationOptions(),
	);
	const { mutateAsync: createTransaction } = useMutation(
		trpc.user.createTransaction.mutationOptions(),
	);
	const { mutateAsync: sendTransaction } = useMutation(
		trpc.user.payBySolBalance.mutationOptions(),
	);
	const [amount, setAmount] = useState(0);
	const [feePaid, setFeePaid] = useState(false);
	const handlePayFee = async () => {
		toast.promise(sendTransaction({ amount }), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" /> <p>Paying fee...</p>
				</div>
			),
			success: (res) => {
				if (res.error) {
					return res.error;
				}
				setFeePaid(true);
				return res.message;
			},
			error: (error) =>
				error instanceof Error ? error.message : "Something went wrong",
		});
	};

	const handleWithdraw = async () => {
		if (amount < 100) {
			toast.error("Minimum withdrawal amount is $100");
			return;
		}
		if (amount > 500) {
			toast.error("Maximum withdrawal amount is $500");
			return;
		}
		if (!feePaid) {
			toast.error("Please pay the fee first");
			return;
		}
		const result = toast.promise(
			withdraw({ balance: user?.balance ?? 0 - amount }),
			{
				loading: (
					<div className="flex items-center justify-between">
						<Loader2 className="size-4 animate-spin" />{" "}
						<p>INitializing withdrawal</p>
					</div>
				),
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
		if ((await result.unwrap()).success) {
			toast.promise(
				createTransaction({
					type: "withdrawal",
					amount,
				}),
				{
					loading: (
						<div className="flex items-center justify-between">
							<Loader2 className="size-4 animate-spin" />{" "}
							<p>Creating withdrawal request</p>
						</div>
					),
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
		}
	};
	const feeAmount = (amount * 10) / 100;

	if (error) {
			toast.error('Something went wrong', {
				description: error.message
			})
		}
	return (
		<Drawer>
			<DrawerTrigger className={buttonVariants({ variant: "secondary" })}>
				Withdraw
			</DrawerTrigger>
			<DrawerContent className="px-4">
				<DrawerHeader>
					<DrawerTitle>Withdraw Funds</DrawerTitle>
					<DrawerDescription>
						Each withdrawal is charged a 10% fee. Minimum withdrawal amount is $100, maximum is $500.
					</DrawerDescription>
				</DrawerHeader>
				<CardContent className="grid gap-4">
					<div className="flex flex-col gap-2">
						<Label>Available Balance</Label>
						<div className="text-2xl font-semibold">
							<Dollar value={user?.balance ?? 0} />
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Withdrawal Amount</Label>
						<Input
							type="number"
							min={100}
							max={500}
							value={amount}
							onChange={(e) => setAmount(Number(e.target.value))}
							placeholder="Enter amount to withdraw"
						/>
					</div>
					{amount >= 100 && (
						<div className="flex flex-col gap-2">
							<Label>Fee Required</Label>
							<div className="flex items-center justify-between">
								<span>30% (${feeAmount})</span>
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
