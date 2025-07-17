import { Preferences } from "~/components/settings/preferences";
import { TelegramDetails } from "~/components/settings/telegram";
import { UserData } from "~/components/settings/user-data";
import { Wallet } from "~/components/settings/wallet";
import { PageWrapper } from "~/components/page";

export default function Page() {
	return (
		<PageWrapper>
		<main className="flex flex-col items-center gap-4">
			<UserData />
			<TelegramDetails />
			<Preferences />
			<Wallet />
		</main>
		</PageWrapper>
	);
}
