import background from "~/assets/galaxy_bg.png";
import { Button } from "~/components/ui/button";
import { useStepStore } from "~/lib/store";
import { FinalStep } from "./final";
import { WelcomePlan } from "./plan";
import { WelcomeWallet } from "./wallet";

export function Welcome() {
	const { step, setStep } = useStepStore();
	return step === 0 ? (
		<main className="flex flex-col items-center gap-4">
			<img src={background} alt="background" />
			<h2 className="font-semibold text-4xl text-pretty px-4">
				Unlock your crypto's hidden potential
			</h2>
			<p className="text-2xl text-pretty px-4 text-secondary-foreground">
				Discover new ways to grow your income with our innovative platform
			</p>
			<Button onClick={() => setStep(step + 1)}>Get Started</Button>
		</main>
	) : step === 1 ? (
		<WelcomeWallet />
	) : step === 2 ? (
		<WelcomePlan />
	) : (
		<FinalStep />
	);
}
