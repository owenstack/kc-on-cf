import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function UpdateBan({
	userId,
	banned,
}: {
	userId: number;
	banned: boolean;
}) {
	const [open, setOpen] = useState(false);
	const [banReason, setBanReason] = useState("");
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.admin.updateUser.mutationOptions(),
	);

	const updateBan = async () => {
		toast.promise(
			mutateAsync({
				id: userId,
				banned: !banned,
				banReason: !banned ? banReason.trim() : "",
			}),
			{
				loading: (
					<div className="flex items-center justify-between">
						<Loader2 className="size-4 animate-spin" /> <p>Updating user...</p>
					</div>
				),
				success: (res) => {
					if (res.error) {
						return res.error;
					}
					setOpen(false);
					return res.message;
				},
				error: (error) =>
					error instanceof Error
						? error.message
						: "Failed to update user status",
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
			>
				{banned ? "Unban User" : "Ban User"}
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{banned ? "Unban User" : "Ban User"}
					</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to {banned ? "unban" : "ban"} this user?
						{!banned && " This action will restrict the user's access."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				{!banned && (
					<div className="space-y-4">
						<Label htmlFor="ban-reason">Ban Reason</Label>
						<Input
							id="ban-reason"
							value={banReason}
							onChange={(e) => setBanReason(e.target.value)}
							placeholder="Enter reason for ban"
							required
						/>
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={updateBan}>
						{isPending ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Processing...
							</>
						) : (
							"Confirm"
						)}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
