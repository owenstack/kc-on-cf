import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Rocket } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { TopBoostersChart } from "./booster-chart";
import { AllBoostersTable } from "./booster-table";
import { KeyMetrics } from "./key-metrics";
import type { BoosterOverview } from "~/lib/constants";

export function AdminBooster() {
	const trpc = useTRPC();
	const { data, isFetching, error } = useQuery(
		trpc.admin.getBoosters.queryOptions(),
	);
	if (isFetching) {
		return <BoosterAnalyticsSkeleton />;
	}
	if (error || !data) {
		return (
			<Card className="flex flex-col items-center justify-center p-8 w-full max-w-sm">
				<AlertTriangle className="h-12 w-12 text-destructive" />
				<p className="mt-4 text-lg font-semibold">
					Failed to load booster data.
				</p>
				<p className="text-sm text-muted-foreground">{error?.message}</p>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle className="text-2xl">Booster Analytics</CardTitle>
				<Rocket className="h-6 w-6 text-muted-foreground" />
			</CardHeader>
			<CardContent className="space-y-8">
				{/* Section 1: KPIs */}
				<KeyMetrics
					totalRevenue={data.totalRevenue}
					totalActiveBoosters={data.totalActiveBoosters}
					averageBoosterPrice={data.averageBoosterPrice}
				/>
				{/* Section 2: Top Performing Chart */}
				<TopBoostersChart topPurchased={data.topPurchased as BoosterOverview[]} />

				{/* Section 3: Scrollable Table */}
				<AllBoostersTable allBoosters={data.allBoosters as BoosterOverview[]} />
			</CardContent>
		</Card>
	);
}

const BoosterAnalyticsSkeleton = () => (
	<Card className="w-full max-w-sm">
		<CardHeader>
			<Skeleton className="h-8 w-1/3" />
		</CardHeader>
		<CardContent className="space-y-8">
			<div className="grid gap-4 md:grid-cols-3">
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
			</div>
			<div>
				<Skeleton className="h-8 w-1/4 mb-4" />
				<Skeleton className="h-64" />
			</div>
			<div>
				<Skeleton className="h-8 w-1/4 mb-4" />
				<Skeleton className="h-96" />
			</div>
		</CardContent>
	</Card>
);
