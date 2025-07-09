import { BalanceCard } from "~/components/index/balance-card";
import { LiveChart } from "~/components/index/live-chart";
import { MultiplierCard } from "~/components/index/multiplier-card";

export default function Index() {
	return (
		<main className="flex flex-col items-center gap-4">
			<BalanceCard />
			<LiveChart />
			<MultiplierCard />
		</main>
	);
}
