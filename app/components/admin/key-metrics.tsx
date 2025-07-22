import { BarChart, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Dollar } from "../dollar";

interface KeyMetricsProps {
	totalRevenue: number;
	totalActiveBoosters: number;
	averageBoosterPrice: number;
}

export function KeyMetrics({
	totalRevenue,
	totalActiveBoosters,
	averageBoosterPrice,
}: KeyMetricsProps) {
	return (
		<div>
			<h3 className="text-lg font-medium mb-4">Overall Performance</h3>
			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							<Dollar value={totalRevenue} />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Active RPC Nodes
						</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{totalActiveBoosters.toLocaleString()}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">
							Avg. RPC Node Price
						</CardTitle>
						<BarChart className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							<Dollar value={averageBoosterPrice} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
