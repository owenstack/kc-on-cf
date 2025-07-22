import { Input } from "../ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

export function SetPrice() {
	const trpc = useTRPC();
	const { data: price } = useQuery(trpc.user.getPrice.queryOptions());
	const { mutateAsync } = useMutation(trpc.admin.setPrice.mutationOptions());
	const [input, setInput] = useState(price ?? 0);

    const submit = async () => {
        toast.promise(mutateAsync({value: input}), {
            loading: (
					<div className="flex items-center justify-between">
						<Loader2 className="size-4 animate-spin" /> <p>Updating user...</p>
					</div>
				),
            success: (res) => {
                if (res.error) {
                    return res.error;
                }
                return res.message;
            },
            error: (error) =>
                error instanceof Error ? error.message : "Internal server error",
        })
    }

	return (
		<Card className="w-full mt-4 max-w-sm md:max-w-md">
            <CardHeader>
                <CardTitle>Set Price</CardTitle>
                <CardDescription>Current price: {price} SOL</CardDescription>
            </CardHeader>
			<CardContent className="grid gap-2">
				<Input type='number'
					value={input}
					onChange={(e) => setInput(Number(e.target.value))}
					placeholder="Enter new price"
				/>
				<Button onClick={submit}>Set Price</Button>
			</CardContent>
		</Card>
	);
}