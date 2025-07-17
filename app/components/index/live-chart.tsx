import { useQuery } from "@tanstack/react-query";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTRPC } from "~/trpc/client";
import { Badge } from "../ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";
import { Skeleton } from "../ui/skeleton";

export function LiveChart() {
	const trpc = useTRPC();
	const { data, error } = useQuery(trpc.user.getUserSolBalance.queryOptions());
	const { data: chartData } = useQuery({
		...trpc.live.mevData.queryOptions(),
		refetchInterval: 10000,
		refetchOnWindowFocus: false,
		enabled: data != null && data >= 3.5,
	});
	const { data: activeBoosters, error: activeBoostersError } = useQuery(
		trpc.user.getUserBoosters.queryOptions(),
	);

	if (error || activeBoostersError) {
		return (
			<Card className="flex flex-col items-center justify-center p-8 w-full max-w-sm">
				<AlertCircle className="h-12 w-12 text-destructive" />
				<p className="mt-4 text-lg font-semibold">
					Failed to load live chart data.
				</p>
				<p className="text-sm text-muted-foreground">{error?.message || activeBoostersError?.message}</p>
			</Card>
		);
	}
	const formatTimestamp = (timestamp: number) => {
		return new Date(timestamp).toLocaleTimeString();
	};

	const formatValue = (value: number) => {
		return `${value.toFixed(2)}`;
	};

	const placeholderData = Array.from({ length: 10 }, (_, i) => ({
		timestamp: Date.now() - (9 - i) * 1000 * 60,
		value: 0
	}));

	const displayData = chartData || placeholderData;

	return (
		<Card className="h-[22rem] max-w-sm md:max-w-md md:h-[400px] mt-4 w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>MEV Bot Profit/Loss</CardTitle>
						<CardDescription>Real-time profit/loss tracking</CardDescription>
					</div>
					{activeBoosters && activeBoosters.length > 0 && (
						<Badge variant="secondary" className="flex items-center gap-1">
							<Zap className="h-3 w-3" />
							{activeBoosters.length} Active
						</Badge>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<AreaChart
						accessibilityLayer
						data={displayData}
						margin={{
							top: 10,
							right: 30,
							left: 0,
							bottom: 0,
						}}
					>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis
							dataKey="timestamp"
							tickFormatter={formatTimestamp}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<YAxis
							tickFormatter={formatValue}
							tickLine={false}
							axisLine={false}
							tickMargin={8}
						/>
						<ChartTooltip
							labelFormatter={formatTimestamp}
							formatter={(value: number) => [formatValue(value), "Profit"]}
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>
						<Area
							type="natural"
							dataKey="value"
							stroke="var(--color-desktop)"
							fill="var(--color-desktop)"
							fillOpacity={0.2}
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
			<span className="flex items-center gap-2 p-4 font-medium leading-none">
				Live MEV Bot Performance <TrendingUp className="h-4 w-4" />
			</span>
		</Card>
	);
}

export function LiveChartSkeleton() {
	return (
		<Card className="h-[22rem] max-w-sm md:max-w-md md:h-[400px] mt-4 w-full">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<Skeleton className="h-6 w-32" />
						<Skeleton className="h-4 w-40 mt-2" />
					</div>
					<Skeleton className="h-6 w-24" />
				</div>
			</CardHeader>
			<CardContent>
				<Skeleton className="h-[200px] w-full md:h-[280px]" />
			</CardContent>
			<Skeleton className="h-6 w-48 mx-4 mb-4" />
		</Card>
	);
}

const chartConfig = {
	desktop: {
		label: "Desktop",
		color: "#2563eb",
	},
	mobile: {
		label: "Mobile",
		color: "#60a5fa",
	},
} satisfies ChartConfig;
