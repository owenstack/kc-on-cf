import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useTRPC } from "~/trpc/client";
import { Skeleton } from "./ui/skeleton";
import { useStepStore } from "~/lib/store";

export function ConnectKit() {
	const [ConnectKitButton, setConnectKitButton] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { step, setStep } = useStepStore();

	useEffect(() => {
		const loadConnectKit = async () => {
			try {
				const { ConnectKitButton: CKButton } = await import("connectkit");
				setConnectKitButton(() => CKButton);
			} catch (error) {
				console.error("Failed to load ConnectKit:", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadConnectKit();
	}, []);
	const trpc = useTRPC();
	const { mutateAsync } = useMutation(trpc.user.updateUser.mutationOptions());

	const handleConnect = async () => {
		toast.promise(mutateAsync({ walletKitConnected: true }), {
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
		<>
			{isLoading ? (
				<Skeleton className="h-10 w-full" />
			) : ConnectKitButton ? (
				<ConnectKitButton.Custom>
					{({ isConnected, show, truncatedAddress, ensName, isConnecting }) => {
						if (isConnected) {
							handleConnect();
							return (
								<Button size={"lg"} onClick={show} disabled={isConnecting}>
									{isConnecting ? (
										<>
											<Loader2 className="animate-spin size-4" /> Connecting...
										</>
									) : (
										(ensName ?? truncatedAddress)
									)}
								</Button>
							);
						}
						return (
							<Button size={"lg"} onClick={show} disabled={isConnecting}>
								Connect CEX Wallet
							</Button>
						);
					}}
				</ConnectKitButton.Custom>
			) : (
				<Button disabled>Connect Wallet (Failed to load)</Button>
			)}
		</>
	);
}
