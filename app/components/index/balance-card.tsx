import { useQuery } from "@tanstack/react-query";
import {  RefreshCw } from "lucide-react";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import { Dollar } from "../dollar";
import { Button } from "../ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Deposit } from "./deposit-dialog";
import { Withdraw } from "./withdraw-dialog";
import { toast } from "sonner";
import { copyTextToClipboard } from "@telegram-apps/sdk-react";

export function BalanceCard() {
	const trpc = useTRPC();
	const { data, refetch, isRefetching, isPending, error } = useQuery({
		...trpc.user.getUser.queryOptions(),
		refetchInterval: 10000,
		refetchOnWindowFocus: false,
		select: (data) => {
			return {
				balance: data?.walletBalance ?? 0,
				publicKey: data?.publicKey ?? "",
			};
		},
	});
	const {data: price} = useQuery(trpc.user.getPrice.queryOptions())

	const handleMine = async () => {
		refetch()
		if (data !== undefined && data.balance <= price!) {
			toast.error(`You need at least ${price} SOL to mine`, {
				description: "Press this button to copy your wallet address",
				action: <Button onClick={() => {copyTextToClipboard(data.publicKey)
					toast.success("Copied to clipboard")
				}}>Copy</Button>
			});
			return;
		}
	}

	if (error) {
		toast.error('Something went wrong', {
			description: error.message
		})
	}

	return (
		<Card className="w-full mt-4 max-w-sm md:max-w-md">
			<CardHeader className="flex item-center justify-between">
				<div>
					<CardTitle className="text-4xl">
						<Dollar value={data?.balance ?? 0} />
					</CardTitle>
					<CardDescription className="flex items-center">
						Earned balance
						<Button
							variant="ghost"
							size={"icon"}
							className="ml-2"
							onClick={() => refetch()}
							disabled={isPending || isRefetching}
						>
							<RefreshCw
								className={cn(
									"size-4",
									isPending || isRefetching ? "animate-spin" : "",
								)}
							/>
						</Button>
					</CardDescription>
				</div>
				<CardAction className="flex flex-col gap-2 items-end">
					<Button variant={'outline'} onClick={handleMine} disabled={isPending || isRefetching}>
						Start MEV
					</Button>
					<Deposit />
					<Withdraw />
				</CardAction>
			</CardHeader>
		</Card>
	);
}

export function BalanceCardSkeleton() {
	return (
		<Card className="w-full max-w-sm mt-4 md:max-w-md">
			<CardHeader className="flex item-center justify-between">
				<div>
					<CardTitle className="text-4xl">
						<Skeleton className="h-10 w-32" />
					</CardTitle>
					<CardDescription className="flex items-center">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="ml-2 h-8 w-8 rounded-full" />
					</CardDescription>
				</div>
				<CardAction>
					<Skeleton className="h-10 w-24" />
				</CardAction>
			</CardHeader>
		</Card>
	);
}
