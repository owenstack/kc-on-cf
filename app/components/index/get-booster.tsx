import { useMutation, useQuery } from "@tanstack/react-query";
import type { Booster } from "generated/prisma";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
	const { mutateAsync: sendTransaction } = useMutation(
		trpc.user.payBySolBalance.mutationOptions(),
	);
	const { data, refetch } = useQuery({
		...trpc.user.getUser.queryOptions(),
		select: (data) => {
			return {
				balance: data.balance,
			};
		},
	});
	const { mutateAsync: purchaseBooster } = useMutation(
		trpc.booster.purchaseBooster.mutationOptions(),
	);

	const payByBalance = async () => {
		if (!data || data.balance < booster.price) {
			toast.error("Insufficient balance to purchase this booster.");
			return;
		}
		toast.promise(purchaseBooster({ boosterId: booster.id }), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" /> <p>Confirming purchase</p>
				</div>
			),
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
		const result = toast.promise(sendTransaction({ amount: booster.price }), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" /> <p>Confirming purchase</p>
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
		});
		if ((await result.unwrap()).success) {
			toast.promise(
				purchaseBooster({ boosterId: booster.id, externalPayment: true }),
				{
					loading: (
						<div className="flex items-center justify-between">
							<Loader2 className="size-4 animate-spin" />{" "}
							<p>Applying booster...</p>
						</div>
					),
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
			refetch();
			setOpen(false);
		}
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
				</CardContent>
			</DialogContent>
		</Dialog>
	);
}
