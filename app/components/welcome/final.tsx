import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import rocket from "~/assets/product-launch.svg";
import { useTRPC } from "~/trpc/client";
import { Button } from "../ui/button";

export function FinalStep() {
	const trpc = useTRPC();
	const { data: plan } = useQuery({
		...trpc.user.getUserPlan.queryOptions(),
		refetchOnWindowFocus: false,
	});
	const { data: user } = useQuery({
		...trpc.user.getUser.queryOptions(),
		refetchOnWindowFocus: false,
	});
	const { mutateAsync } = useMutation(trpc.user.updateUser.mutationOptions());

	const handleFinal = async () => {
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
		<main className="flex flex-col items-center gap-4">
			<img
				src={rocket}
				alt="Rocket"
				className="bg-gradient-to-r from-blue-600 via-purple-600 to-black transition-colors max-w-sm rounded-lg"
				style={{
					backgroundSize: "200% 200%",
					animation: "15s ease infinite",
				}}
			/>
			<h3 className="text-pretty text-xl font-semibold">Order Summary</h3>
			<div className=" rounded-lg p-6 shadow-sm space-y-4 min-w-[300px]">
				<div className="text-center mb-4">
					<h4 className="font-medium text-gray-900">Receipt</h4>
					<p className="text-sm text-gray-500">
						{new Date().toLocaleDateString()}
					</p>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between py-2  border-t-2">
						<span className="text-gray-600">Plan</span>
						<span className="font-medium">{plan?.planType}</span>
					</div>

					<div className="flex justify-between py-2  border-t-2">
						<span className="text-gray-600">Wallet</span>
						<span className="font-medium">
							{user?.publicKey.slice(0, 6)}...${user?.publicKey.slice(-6)}
						</span>
					</div>

					<div className="flex justify-between py-2  border-t-2">
						<span className="text-gray-600">Amount</span>
						<span className="font-medium">${plan?.amount}</span>
					</div>
				</div>
			</div>
			<Button onClick={handleFinal}>Confirm & Start Mining</Button>
		</main>
	);
}
