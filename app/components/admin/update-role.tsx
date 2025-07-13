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

export function UpdateRole({
	userId,
	currentRole,
}: {
	userId: string;
	currentRole: "admin" | "user";
}) {
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.admin.updateUser.mutationOptions(),
	);

	const updateRole = async () => {
		toast.promise(
			mutateAsync({
				id: userId,
				role: currentRole === "admin" ? "user" : "admin",
			}),
			{
				loading: (
					<div className="flex items-center justify-between">
						<Loader2 className="size-4 animate-spin" /> <p>Changing role...</p>
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
					error instanceof Error ? error.message : "Failed to change role",
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger
				className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
			>
				Change Role
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Change User Role</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to change the role of this user? This user
						will become
						{currentRole === "admin" ? "a regular user" : "an admin"}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={isPending} onClick={updateRole}>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
