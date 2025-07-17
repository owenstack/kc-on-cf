import { useQuery } from "@tanstack/react-query";
import {
	BalanceCard,
	BalanceCardSkeleton,
} from "~/components/index/balance-card";
import { LiveChart, LiveChartSkeleton } from "~/components/index/live-chart";
import { MultiplierCard } from "~/components/index/multiplier-card";
import { ReferralCard } from "~/components/index/referral-card";
import { WelcomeWallet } from "~/components/welcome/wallet";
import { useTRPC } from "~/trpc/client";
import { PageWrapper } from "~/components/page";

export default function Index() {
	const trpc = useTRPC();
	const { data: user, isPending } = useQuery({
		...trpc.user.getUser.queryOptions(),
		refetchOnWindowFocus: false,
	});

	return (
	<PageWrapper back={false}>
		<main className="flex flex-col items-center gap-4">
			{isPending ? (
				<>
					<BalanceCardSkeleton />
					<LiveChartSkeleton />
				</>
			) : user?.banned ? (
				`You have been banned for: ${user.banReason}`
			) : !user?.isOnboarded ? (
				<WelcomeWallet />
			) : (
				<>
					<BalanceCard />
					<LiveChart />
					<MultiplierCard />
					<ReferralCard />
				</>
			)}
		</main>
		</PageWrapper>
	);
}
