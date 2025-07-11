import { useStepStore } from "~/lib/store";
import { FinalStep } from "./final";
import { WelcomePlan } from "./plan";
import { WelcomeWallet } from "./wallet";

export function Welcome() {
	const { step } = useStepStore();
	return step === 0 ? (
		<WelcomeWallet />
	) : step === 1 ? (
		<WelcomePlan />
	) : (
		<FinalStep />
	);
}
