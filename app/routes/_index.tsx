import { useQuery } from "@tanstack/react-query";
import {
	BalanceCard,
	BalanceCardSkeleton,
} from "~/components/index/balance-card";
import { LiveChart, LiveChartSkeleton } from "~/components/index/live-chart";
import { MultiplierCard } from "~/components/index/multiplier-card";
import { PlanExpired } from "~/components/index/plan-expired";
import { Welcome } from "~/components/welcome/welcome";
import { useTRPC } from "~/trpc/client";

export default function Index() {
	const trpc = useTRPC();
	const { data: user, isPending } = useQuery({
		...trpc.user.getUser.queryOptions(),
		refetchOnWindowFocus: false,
	});
	const { data: plan, isPending: loading } = useQuery({
		...trpc.user.getUserPlan.queryOptions(),
		refetchOnWindowFocus: false,
	});

	return (
		<main className="flex flex-col items-center gap-4">
			{isPending || loading ? (
				<>
					<BalanceCardSkeleton />
					<LiveChartSkeleton />
				</>
			) : !user?.isOnboarded ? (
				<Welcome />
			) : !plan || plan.endDate.getTime() < Date.now() ? (
				<PlanExpired />
			) : (
				<>
					<BalanceCard />
					<LiveChart />
					<MultiplierCard />
				</>
			)}
		</main>
	);
}
