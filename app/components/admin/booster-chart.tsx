import { Bar, BarChart, XAxis, YAxis } from "recharts";
import type { BoosterOverview } from "~/lib/constants";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../ui/chart";

export function TopBoostersChart({
	topPurchased,
}: {
	topPurchased: BoosterOverview[];
}) {
	const chartData = topPurchased.map((booster) => ({
		name: booster.name,
		Purchases: booster.analytics.totalPurchases,
	}));

	return (
		<div>
			<h3 className="text-lg font-medium mb-4">
				Top Performing RPC Nodes by Purchases
			</h3>
			<div className="h-[250px] w-full">
				<ChartContainer config={chartConfig}>
					<BarChart
						data={chartData}
						layout="vertical"
						margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
					>
						<XAxis type="number" />
						<YAxis
							dataKey="name"
							type="category"
							width={100}
							tickLine={false}
							axisLine={false}
						/>
						<ChartTooltip
							labelFormatter={(label) => `Booster: ${label}`}
							cursor={{ fill: "hsl(var(--muted))" }}
							content={<ChartTooltipContent indicator="dashed" />}
						/>
						<Bar
							dataKey="Purchases"
							fill="hsl(var(--desktop))"
							radius={[0, 4, 4, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</div>
		</div>
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
