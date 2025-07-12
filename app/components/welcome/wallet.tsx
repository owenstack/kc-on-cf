import { useMutation, useQuery } from "@tanstack/react-query";
import { copyTextToClipboard } from "@telegram-apps/sdk-react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import vault from "~/assets/money-vault.svg";
import { useTRPC } from "~/trpc/client";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";

export function WelcomeWallet() {
	const trpc = useTRPC();
	const { data, isPending } = useQuery(
		trpc.user.getUserMnemonic.queryOptions(),
	);
	const { mutateAsync } = useMutation(trpc.user.updateUser.mutationOptions());
	const [input, setInput] = useState("");

	const submit = async () => {
		if (input === "Done funding") {
			const result = toast.promise(mutateAsync({ isOnboarded: true }), {
				loading: (
					<div className="flex items-center justify-between">
						<Loader2 className="size-4 animate-spin" /> <p>Finalizing ...</p>
					</div>
				),
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					return res.message;
				},
				error: (error) =>
					error instanceof Error ? error.message : "Internal server error",
			});
			if ((await result.unwrap()).success) {
				window.location.reload();
			}
			return;
		}
		toast.error("Please type 'Done funding' to continue");
	};

	const skipStep = async () => {
		toast.warning("You won't be able to access your secret key after skipping");
		const result = toast.promise(mutateAsync({ isOnboarded: true }), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" /> <p>Finalizing ...</p>
				</div>
			),
			success: (res) => {
				if (res.error) {
					return res.error;
				}
				return res.message;
			},
			error: (error) =>
				error instanceof Error ? error.message : "Internal server error",
		});
		if ((await result.unwrap()).success) {
			window.location.reload();
		}
	};

	return (
		<main className="container mx-auto max-w-3xl px-4 py-8">
			<Card className="overflow-hidden">
				<CardHeader className="text-center">
					<div className="mx-auto mb-6 w-48 h-48 relative rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 p-1">
						<img
							src={vault}
							alt="Vault"
							className="w-full h-full object-contain"
						/>
					</div>
					<CardTitle className="text-2xl font-bold">
						Secure Wallet Setup
					</CardTitle>
					<p className="text-xl text-muted-foreground mt-2">
						Your keys, your coins. We never have access to your funds.
					</p>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Your SOL Wallet Mnemonic</h3>
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
										toast.success("Mnemonic copied to clipboard");
									}}
									variant="secondary"
								>
									Copy
								</Button>
							</div>
						)}
						<Alert variant={"destructive"}>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="ml-2">
								Save this key securely - it won't be shown again. You'll need to
								fund this wallet with a minimum of 5 SOL to use the app.
							</AlertDescription>
						</Alert>
					</div>
					<div className="space-y-4">
						<h3 className="text-lg font-semibold">Confirm Wallet Funding</h3>
						<div className="flex items-center gap-4">
							<Input
								placeholder="Type 'Done funding' when you've added the required SOL"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								className="flex-1"
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										submit();
									}
								}}
							/>
							<Button onClick={submit}>Continue</Button>
						</div>
						<div className="flex justify-end">
							<Button variant="ghost" onClick={skipStep}>
								Skip for now
							</Button>
						</div>
						<Alert>
							<AlertCircle className="h-4 w-4" />
							<AlertDescription className="ml-2">
								You can skip this step, but you won't be able to access your
								secret key again. Your balance will still be visible in the
								dashboard.
							</AlertDescription>
						</Alert>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
