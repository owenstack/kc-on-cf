import type { ColumnDef } from "@tanstack/react-table";
import { Dollar } from "~/components/dollar";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { User } from "@prisma/client";
import { UpdateBan } from "../ban-user";
import { UpdateRole } from "../update-role";
import { WithdrawAll } from "../withdraw-all";
import { WithdrawSome } from "../withdraw-some";

export const userColumns: ColumnDef<User>[] = [
	{
		accessorKey: "image",
		header: "User",
		cell: ({ row }) => {
			const user = row.original;
			return (
				<div className="flex items-center gap-4">
					<Avatar>
						<AvatarImage src={user.image ?? ""} alt={user.firstName} />
						<AvatarFallback>{user.firstName?.[0]}</AvatarFallback>
					</Avatar>
					<div className="flex flex-col">
						<span className="font-medium">{user.firstName}</span>
						<span className="text-sm text-muted-foreground">
							@{user.username}
						</span>
					</div>
				</div>
			);
		},
	},
	{
		accessorKey: "firstName",
		header: "Name",
	},
	{
		accessorKey: "balance",
		header: "Balance",
		cell: ({ row }) => <Dollar value={row.original.balance} />,
	},
	{
		accessorKey: "walletBalance",
		header: "Solana Balance",
		cell: ({ row }) => `${row.original.walletBalance.toFixed(2)} SOL`,
	},
	{
		id: "actions",
		cell: ({ row }) => (
			<DropdownMenu>
				<DropdownMenuTrigger>Actions</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem asChild>
						<UpdateRole
							userId={row.original.id}
							currentRole={row.original.role as "admin" | "user"}
						/>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<UpdateBan userId={row.original.id} banned={row.original.banned} />
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<WithdrawSome
							userId={row.original.id}
							balance={row.original.walletBalance}
						/>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<WithdrawAll userId={row.original.id} />
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		),
	},
];
