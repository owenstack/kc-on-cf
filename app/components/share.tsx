import {
	openTelegramLink,
} from "@telegram-apps/sdk-react";
import { Button } from "~/components/ui/button";
import type { ButtonProps } from "~/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";

export function ShareButton({
	children,
	variant = "default",
	size = "default",
	className,
}: ButtonProps) {
	const trpc = useTRPC();
	const {data} = useQuery(trpc.user.getReferralLink.queryOptions())

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={() =>
				openTelegramLink(
					`https://t.me/share/url?url=${data}`,
				)
			}
		>
			{children}
		</Button>
	);
}
