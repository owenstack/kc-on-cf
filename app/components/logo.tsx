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
		const now = Date.now();
		const newClicks = [...clicks, now];

		clearTimeout(timeoutRef.current);
		timeoutRef.current = window.setTimeout(() => {
			if (newClicks.length < 3) {
				navigate("/");
			}
			setClicks([]);
		}, 1500);

		if (newClicks.length === 3) {
			const intervals = newClicks.slice(1).map((t, i) => t - newClicks[i]);
			const [first, second] = intervals;

			if (first < 500 && second < 500) {
				navigate("/admin");
				setClicks([]);
				return;
			}
		}

		setClicks(newClicks);
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
