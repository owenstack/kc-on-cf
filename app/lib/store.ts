import { create } from "zustand";

interface StepStore {
	step: number;
	setStep: (step: number) => void;
	clearStep: () => void;
}

export const useStepStore = create<StepStore>((set) => ({
	step: 0,
	setStep: (step) => set({ step }),
	clearStep: () => set({ step: 0 }),
}));
