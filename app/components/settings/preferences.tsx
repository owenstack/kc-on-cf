import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

export function Preferences() {
	const [tnotif, setTnotif] = useState(false);
	const [alerts, setAlerts] = useState(false);
	const [news, setNews] = useState(false);
	const [loading, setLoading] = useState(false);

	const changeNotif = () => {
		setLoading(true);
		setTimeout(() => {
			setTnotif(true);
			toast.success("Updated successfully");
			setLoading(false);
		}, 2000);
	};

	const changeAlerts = () => {
		setLoading(true);
		setTimeout(() => {
			setAlerts(true);
			toast.success("Updated successfully");
			setLoading(false);
		}, 2000);
	};

	const changeNews = () => {
		setLoading(true);
		setTimeout(() => {
			setNews(true);
			toast.success("Updated successfully");
			setLoading(false);
		}, 2000);
	};

	return (
		<Card className="w-full max-w-sm">
			<CardHeader>
				<CardTitle>Preferences</CardTitle>
				<CardDescription>
					Customize your trading and notification settings
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-4">
					<div className="flex items-center space-x-2">
						{loading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Switch
								defaultChecked={tnotif}
								onChange={changeNotif}
								id="trading-notifications"
							/>
						)}
						<Label htmlFor="trading-notifications">Trading Notifications</Label>
					</div>
					<div className="flex items-center space-x-2">
						{loading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Switch
								defaultChecked={alerts}
								onChange={changeAlerts}
								id="price-alerts"
							/>
						)}
						<Label htmlFor="price-alerts">Price Alerts</Label>
					</div>
					<div className="flex items-center space-x-2">
						{loading ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Switch
								defaultChecked={news}
								onChange={changeNews}
								id="news-updates"
							/>
						)}
						<Label htmlFor="news-updates">Market News Updates</Label>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
