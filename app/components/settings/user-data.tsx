import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export function UserData() {
	const trpc = useTRPC();
	const { data: user } = useQuery(trpc.user.getUser.queryOptions());

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Profile information</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<div>
						<span className="font-medium">Username:</span> {user?.username}
					</div>
					<div>
						<span className="font-medium">First name:</span> {user?.firstName}
					</div>
					<div>
						<span className="font-medium">Last name:</span> {user?.lastName}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
