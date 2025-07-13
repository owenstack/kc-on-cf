import { useQuery } from "@tanstack/react-query";
import { initDataState, useSignal } from "@telegram-apps/sdk-react";
import { Settings, Share2 } from "lucide-react";
import { Link } from "react-router";
import { useTRPC } from "~/trpc/client";
import { Logo } from "./logo";
import { ShareButton } from "./share";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

export function Header() {
	const trpc = useTRPC();
	const { data, isPending, error } = useQuery(trpc.user.getUser.queryOptions());
	const tgData = useSignal(initDataState);
	const user = tgData?.user;

	const displayUser = data || {
		firstName: user?.first_name || "User",
		lastName: user?.last_name || null,
		username: user?.username || null,
		balance: 0,
	};
	// if (error) {
	// 	console.error("Error at header: ", error);
	// 	toast.error("Something went wrong", {
	// 		description: error.message,
	// 	});
	// }

	const userProfileImage = user?.photo_url;
if (error) {
		toast.error('Something went wrong', {
			description: error.message
		})
	}
	return (
		<header className="bg-card border-b border-border shadow-sm top-0 z-20">
			<div className="max-w-7x; mx-auto px-4 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<Logo />
					<div className="flex items-center space-x-4">
						{isPending ? (
							<div className="flex items-center space-x-3">
								<Skeleton className="w-10 h-10 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-[100px]" />
									<Skeleton className="h-3 w-[60px]" />
								</div>
							</div>
						) : user ? (
							<div className="flex items-center space-x-3">
								<div className="flex items-center space-x-2">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Avatar className="size-10 hover:cursor-pointer">
												<AvatarImage src={userProfileImage} alt="User Avatar" />
												<AvatarFallback>
													{displayUser.firstName[0].toUpperCase()}
												</AvatarFallback>
											</Avatar>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<div className="flex items-center justify-start gap-2 p-2">
												<div className="flex flex-col space-y-1 leading-none">
													{displayUser.firstName && (
														<p className="font-medium">
															{displayUser.firstName}
														</p>
													)}
													{displayUser.username && (
														<p className="w-[200px] truncate text-sm text-muted-foreground">
															@{displayUser.username}
														</p>
													)}
												</div>
											</div>
											<DropdownMenuSeparator />
											<DropdownMenuItem asChild>
												<Link
													to="/settings"
													className="flex w-full items-center gap-2 text-sm"
												>
													<Settings className="size-4" />
													Settings
												</Link>
											</DropdownMenuItem>
											<DropdownMenuItem asChild>
												<ShareButton
													variant="secondary"
													className="w-full gap-2 text-sm"
												>
													<Share2 className="size-4" /> Share
												</ShareButton>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						) : (
							<Skeleton className="w-10 h-10 rounded-full" />
						)}
						{isPending ? (
							<Skeleton className="h-6 w-24" />
						) : (
							user && (
								<div className="flex items-center space-x-1 bg-secondary px-3 py-1 rounded-full">
									<span className="text-xs font-medium text-secondary-foreground">
										Balance:
									</span>
									<span className="text-xs font-bold text-primary">
										${displayUser.balance.toLocaleString()}
									</span>
								</div>
							)
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
