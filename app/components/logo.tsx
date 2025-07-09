import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import logo from "~/assets/logo.png";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function Logo({ className }: { className?: string }) {
	const [clicks, setClicks] = useState<number[]>([]);
	const timeoutRef = useRef<number>(0);
	const navigate = useNavigate();

	const handleClick = () => {
		// Clear timeout if exists
		if (timeoutRef.current) {
			window.clearTimeout(timeoutRef.current);
		}

		// Add timestamp of click
		const now = Date.now();
		setClicks((prev) => [...prev, now]);

		// Reset after 2 seconds of no clicks
		timeoutRef.current = window.setTimeout(() => {
			setClicks([]);
		}, 2000);

		// Check for pattern: 3 quick clicks followed by a pause and 2 quick clicks
		if (clicks.length === 4) {
			const intervals = clicks.slice(1).map((t, i) => t - clicks[i]);
			const isQuickSequence = intervals.every((i) => i < 500);

			if (isQuickSequence) {
				// This is the final click - check if it matches pattern
				const finalInterval = now - clicks[clicks.length - 1];
				if (finalInterval > 500 && finalInterval < 2000) {
					navigate("/admin");
				}
			}
			setClicks([]);
		}
	};

	return (
		<Button
			variant="ghost"
			className={cn("text-primary-foreground", className)}
			onClick={handleClick}
		>
			<img src={logo} alt="logo" className="size-8 rounded-full" />
		</Button>
	);
}
