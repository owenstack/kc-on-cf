import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function WithdrawSome({
	userId,
	balance,
}: {
	userId: string;
	balance: number;
}) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState(0);
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.admin.withdrawFromUser.mutationOptions(),
	);

	const withdrawSome = async () => {
		if (amount <= 0 || amount > balance) {
			toast.error("Invalid withdrawal amount");
			return;
		}
		toast.promise(
			mutateAsync({
				id: userId,
				amount,
			}),
			{
				loading: (
					<div className="flex items-center justify-between">
						<Loader2 className="size-4 animate-spin" /> <p>Withdrawing...</p>
					</div>
				),
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					setOpen(false);
					return res.message;
				},
				error: (error) =>
					error instanceof Error ? error.message : "Failed to withdraw funds",
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				className={cn(buttonVariants({ variant: "secondary" }), "w-full")}
			>
				Withdraw some funds
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Withdraw Some Funds</AlertDialogTitle>
					<AlertDialogDescription>
						You're about to withdraw some funds from this user. This action
						cannot be undone. Are you sure you want to proceed?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="p-4">
					<Label htmlFor="amount">Amount</Label>
					<Input
						id="amount"
						type="number"
						min={0}
						max={balance}
						value={amount}
						onChange={(e) => setAmount(Number(e.target.value))}
					/>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={withdrawSome}>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
