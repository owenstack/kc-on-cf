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

export function WithdrawAll({ userId }: { userId: string }) {
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.admin.withdrawFromUser.mutationOptions(),
	);

	const withdrawAll = async () => {
		toast.promise(
			mutateAsync({
				id: userId,
				amount: null,
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
				className={cn(buttonVariants({ variant: "destructive" }), "w-full")}
			>
				Withdraw all
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Withdraw all funds</AlertDialogTitle>
					<AlertDialogDescription>
						You're about to withdraw all funds from this user. This action
						cannot be undone. Are you sure you want to proceed?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={withdrawAll}>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
