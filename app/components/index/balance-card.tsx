import { useTRPC } from "~/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Dollar } from "../dollar";
import { Withdraw } from "./withdraw-dialog";
import { RefreshCw } from "lucide-react";
import { cn } from "~/lib/utils";

export function BalanceCard() {
	const trpc = useTRPC();
	const { data, refetch, isRefetching, isPending } = useQuery({
		...trpc.user.getUser.queryOptions(),
		refetchInterval: 10000,
		refetchOnWindowFocus: false,
		select: (data) => data.balance ?? 0,
	});

	return (
		<Card className="w-full max-w-sm md:max-w-md">
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
				<CardAction>
					<Withdraw />
				</CardAction>
			</CardHeader>
		</Card>
	);
}
