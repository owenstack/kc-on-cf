import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
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
import { Withdraw } from "./withdraw-dialog";
import { Deposit } from "./deposit-dialog";

export function BalanceCard() {
	const trpc = useTRPC();
	const { data, refetch, isRefetching, isPending } = useQuery({
		...trpc.user.getUser.queryOptions(),
		refetchInterval: 10000,
		refetchOnWindowFocus: false,
		select: (data) => data.balance ?? 0,
	});

	return (
		<Card className="w-full mt-4 max-w-sm md:max-w-md">
			<CardHeader className="flex item-center justify-between">
				<div>
					<CardTitle className="text-4xl">
						<Dollar value={data ?? 0} />
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
					<Withdraw />
					<Deposit />
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
