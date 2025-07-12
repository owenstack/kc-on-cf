import { useQuery } from "@tanstack/react-query";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "~/components/ui/card";
import { DataTable } from "~/components/ui/data-table";
import { Skeleton } from "~/components/ui/skeleton";
import { useTRPC } from "~/trpc/client";
import { userColumns } from "./columns";

export function UserTable() {
	const trpc = useTRPC();
	const { data, isFetching, error } = useQuery(
		trpc.admin.getUsers.queryOptions(),
	);
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>User Management</CardTitle>
				<CardDescription>Manage user accounts and permissions</CardDescription>
			</CardHeader>
			<CardContent>
				{isFetching ? (
					<>
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-full" />
					</>
				) : error ? (
					<p>Error loading users</p>
				) : (
					<DataTable columns={userColumns} data={data ?? []} />
				)}
			</CardContent>
		</Card>
	);
}
