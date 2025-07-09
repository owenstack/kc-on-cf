import {
	initDataState,
	openTelegramLink,
	useSignal,
} from "@telegram-apps/sdk-react";
import { Button } from "~/components/ui/button";
import type { ButtonProps } from "~/lib/constants";

export function ShareButton({
	children,
	variant = "default",
	size = "default",
	className,
}: ButtonProps) {
	const tgData = useSignal(initDataState);

	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			onClick={() =>
				openTelegramLink(
					`https://t.me/share/url?url=${import.meta.env.VITE_APP_TITLE}?start=ref=${tgData?.user?.id}`,
				)
			}
		>
			{children}
		</Button>
	);
}
