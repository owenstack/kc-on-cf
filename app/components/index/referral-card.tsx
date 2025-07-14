import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { useTRPC } from "~/trpc/client";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { copyTextToClipboard } from "@telegram-apps/sdk-react";
import { Input } from "../ui/input";

export function ReferralCard() {
	const trpc = useTRPC();
	const { data: referralCount } = useQuery(
		trpc.user.getReferralCount.queryOptions(),
	);
	const { data: referralLink } = useQuery(
		trpc.user.getReferralLink.queryOptions(),
	);

	const handleCopy = () => {
		if (referralLink) {
			copyTextToClipboard(referralLink);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Referrals</CardTitle>
				<CardDescription>
					Invite friends and earn rewards. You have {referralCount ?? 0} referrals.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex items-center gap-2">
					<Input
						type="text"
						value={referralLink ?? ""}
						readOnly
						className="font-mono text-sm"
					/>
					<Button size="icon" onClick={handleCopy}>
						<Copy className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
