import { useQuery } from "@tanstack/react-query";
import { copyTextToClipboard } from "@telegram-apps/sdk-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/client";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button, buttonVariants } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";

export function Wallet() {
	const trpc = useTRPC();
	const { data: publicKey, isPending, error } = useQuery({
		...trpc.user.getUser.queryOptions(),
		select: (data) => data.publicKey,
	});

	if (error) {
		toast.error('Something went wrong', {
			description: error.message
		})
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Wallet details</CardTitle>
				<CardDescription>
					Manage your generated wallet and view your mnemonic phrase
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{isPending ? (
						<div className="flex items-center gap-4">
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-10 w-24" />
						</div>
					) : (
						<div className="flex items-center gap-4">
							<Textarea
								placeholder="Generated wallet public key"
								value={publicKey}
								readOnly
								className="font-mono text-sm"
							/>
							<Button
								onClick={() => {
									copyTextToClipboard(publicKey ?? "");
									toast.success("Public key copied to clipboard");
								}}
								variant="secondary"
							>
								Copy
							</Button>
						</div>
					)}
				</div>
			</CardContent>
			<CardFooter>
				<WalletMnemonic />
			</CardFooter>
		</Card>
	);
}

function WalletMnemonic() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(
		trpc.user.getUserMnemonic.queryOptions(),
	);
	const [open, setOpen] = useState(false);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				className={buttonVariants({ variant: "destructive" })}
				id="mnemonic"
			>
				View Mnemonic
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>View your mnemonic</AlertDialogTitle>
					<AlertDialogDescription>
						Any one with this phrase can gain access to your wallet. Be careful
						with it. Save it securely
					</AlertDialogDescription>
				</AlertDialogHeader>
				{isPending ? (
					<div className="flex items-center gap-4">
						<Skeleton className="h-24 w-full" />
						<Skeleton className="h-10 w-24" />
					</div>
				) : (
					<div className="flex items-center gap-4">
						<Textarea
							placeholder="Generated wallet mnemonic"
							value={data}
							readOnly
							className="font-mono text-sm"
						/>
						<Button
							onClick={() => {
								copyTextToClipboard(data ?? "");
								setOpen(false);
								toast.success("Mnemonic copied to clipboard");
							}}
							variant="secondary"
						>
							Copy
						</Button>
					</div>
				)}
			</AlertDialogContent>
		</AlertDialog>
	);
}
