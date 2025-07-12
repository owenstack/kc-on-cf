import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import type { BoosterOverview } from "~/lib/constants";
import { Dollar } from "../dollar";

export function AllBoostersTable({
	allBoosters,
}: {
	allBoosters: BoosterOverview[];
}) {
	return (
		<div>
			<h3 className="text-lg font-medium mb-4">All Boosters</h3>
			{/* This div makes the table scrollable */}
			<div className="relative h-[400px] overflow-auto rounded-md border">
				<Table>
					{/* The sticky header ensures column names are always visible */}
					<TableHeader className="sticky top-0 bg-background">
						<TableRow>
							<TableHead className="w-[200px]">Booster Name</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Total Purchases</TableHead>
							<TableHead>Revenue</TableHead>
							<TableHead>Active Users</TableHead>
							<TableHead>Unique Users</TableHead>
							<TableHead>Avg. Duration</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{allBoosters.map((booster) => (
							<TableRow key={booster.id}>
								<TableCell className="font-medium">{booster.name}</TableCell>
								<TableCell>
									<Dollar value={booster.price} />
								</TableCell>
								<TableCell>
									{booster.analytics.totalPurchases.toLocaleString()}
								</TableCell>
								<TableCell>
									<Dollar value={booster.analytics.revenue} />
								</TableCell>
								<TableCell>
									{booster.analytics.activeUsers.toLocaleString()}
								</TableCell>
								<TableCell>
									{booster.analytics.uniqueUsers.toLocaleString()}
								</TableCell>
								<TableCell>{booster.analytics.avgDurationDays} days</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
