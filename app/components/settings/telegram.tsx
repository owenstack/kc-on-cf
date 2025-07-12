import { initDataState, useSignal } from "@telegram-apps/sdk-react";
import Telegram from "~/assets/icons";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";

export function TelegramDetails() {
	const tgData = useSignal(initDataState);
	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Telegram Details</CardTitle>
				<CardDescription>
					Manage your Telegram account connection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Telegram className="size-6" />
						<div>
							<p className="font-medium">Connected to Telegram</p>
							<p className="text-sm text-secondary">
								@{tgData?.user?.username}
							</p>
							{tgData?.user?.is_premium ? (
								<p>Telegram premium user</p>
							) : (
								<p>Not using Telegram premium</p>
							)}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
