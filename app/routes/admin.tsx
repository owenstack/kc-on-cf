import { useQuery } from "@tanstack/react-query";
import { AdminBooster } from "~/components/admin/boosters";
import { CreateBoosterDialog } from "~/components/admin/create-booster";
import { UserTable } from "~/components/admin/user-table";
import { BalanceCardSkeleton } from "~/components/index/balance-card";
import { LiveChartSkeleton } from "~/components/index/live-chart";
import { useTRPC } from "~/trpc/client";
import { PageWrapper } from "~/components/page";
import { SetPrice } from "~/components/admin/set-price";

export default function Page() {
	const trpc = useTRPC();
	const { data: user, isPending } = useQuery(trpc.user.getUser.queryOptions());

	return (
		<PageWrapper back>
		<main className="flex flex-col items-center gap-4">
			{isPending ? (
				<>
					<BalanceCardSkeleton />
					<LiveChartSkeleton />
				</>
			) : (
				<>
					<h3 className="font-semibold text-lg place-self-start mt-4 px-4">
						Welcome {user?.username}, what would you like to do?
					</h3>
					<CreateBoosterDialog />
					<SetPrice />
					<AdminBooster />
					<UserTable />
				</>
			)}
		</main></PageWrapper>
	);
}
