import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { PurchaseBooster } from "./get-booster";
import { toast } from "sonner";

export function MultiplierCard() {
	const trpc = useTRPC();
	const { data, isFetching, error } = useQuery(
		trpc.booster.getAvailableBoosters.queryOptions(),
	);

	if (error) {
			toast.error('Something went wrong', {
				description: error.message
			})
		}

	return (
		<Card className="w-full max-w-sm md:max-w-md">
			<CardHeader>
				<CardTitle>Multipliers and boosters</CardTitle>
				<CardDescription>
					Find and purchase multipliers and boosters to increase your balance
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-[300px] w-full">
					<div className="pr-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>RPC Node</TableHead>
									<TableHead>Multiplier</TableHead>
									<TableHead>Duration</TableHead>
									<TableHead>Price (USD)</TableHead>
									<TableHead>Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isFetching ? (
									<Loader2 className="size-4 animate-spin mx-auto my-4" />
								) : (
									data?.map((booster) => (
										<TableRow key={booster.id}>
											<TableCell>{booster.name}</TableCell>
											<TableCell>{booster.multiplier}</TableCell>
											<TableCell>
												{booster.type === "oneTime"
													? "One time"
													: booster.type === "permanent"
														? "Permanent"
														: `${Math.floor(booster?.duration ?? 0 / (1000 * 60 * 60))}h ${Math.floor((booster?.duration ?? 0 % (1000 * 60 * 60)) / (1000 * 60))}m`}
											</TableCell>{" "}
											<TableCell>${booster.price}</TableCell>
											<TableCell>
												<PurchaseBooster booster={booster} />
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
					<ScrollBar orientation="vertical" />
					<ScrollBar orientation="horizontal" />
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
