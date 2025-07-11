import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
import { CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { copyTextToClipboard } from "@telegram-apps/sdk-react";
import { Textarea } from "../ui/textarea";

export function Deposit() {
	const [balance, setBalance] = useState(0);
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();
	const {
		data,
		refetch,
		isPending: loading,
	} = useQuery(trpc.user.getUserSolBalance.queryOptions());
	const { data: publicKey, isPending } = useQuery({
		...trpc.user.getUser.queryOptions(),
		select: (data) => data.publicKey,
	});

	useEffect(() => {
		if (data) {
			setBalance(data);
		}
	}, [data]);
	const checkTransfer = async () => {
		toast.promise(refetch(), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" />{" "}
					<p>Confirming transaction...</p>
				</div>
			),
			success: (res) => {
				if (res.error) {
					return res.error.message;
				}
				setOpen(false);
				return `You topped up ${res.data ?? 0 - balance} SOL`;
			},
			error: (error) =>
				error instanceof Error ? error.message : "Something went wrong",
		});
	};

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger className={buttonVariants()}>Deposit</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Deposit Funds</DrawerTitle>
					<DrawerDescription>
						Your account requires a minimum balance of 5 SOL to operate.
					</DrawerDescription>
				</DrawerHeader>
				<CardContent className="grid gap-4 p-2">
					<h3 className="text-lg font-semibold">Your SOL Wallet Address</h3>
					{isPending ? (
						<div className="flex items-center gap-4">
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-10 w-24" />
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Textarea
								placeholder="Generated wallet address"
								value={publicKey}
								readOnly
								className="font-mono text-sm"
							/>
							<Button
								onClick={() => {
									copyTextToClipboard(publicKey ?? "");
									toast.success("Address copied to clipboard");
								}}
								variant="secondary"
							>
								Copy
							</Button>
						</div>
					)}
				</CardContent>
				<DrawerFooter>
					<Button onClick={checkTransfer} disabled={loading}>
						{loading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							"Confirm Deposit"
						)}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
