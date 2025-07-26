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
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function AllBoostersTable({
	allBoosters,
}: {
	allBoosters: BoosterOverview[];
}) {
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.admin.deleteBooster.mutationOptions())

	const handleDelete = async (boosterId: string) => {
		toast.promise(mutateAsync({ id: boosterId }), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" /> <p>Deleting booster...</p>
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
		})
	}
	return (
		<div>
			<h3 className="text-lg font-medium mb-4">All RPC Nodes</h3>
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
								<TableCell>
									<Button disabled={isPending} variant={'destructive'} onClick={() => handleDelete(booster.id)}>
										{isPending ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
