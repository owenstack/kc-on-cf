import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "~/lib/utils";
import { useTRPC } from "~/trpc/client";
import { Button, buttonVariants } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Form, FormField } from "../ui/form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";

export function CreateBoosterDialog() {
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();
	const { mutateAsync, isPending } = useMutation(
		trpc.admin.createBooster.mutationOptions(),
	);
	const [type, setType] = useState<"oneTime" | "duration" | "permanent">(
		"oneTime",
	);

	const formSchema = z.object({
		name: z.string().min(1, "Name is required"),
		description: z.string().min(1, "Description is required"),
		price: z.number().min(0, "Price must be a positive number"),
		duration: z
			.number()
			.min(0, "Duration must be a positive number"),
		multiplier: z.number().min(1, "Multiplier must be at least 1"),
		type: z.enum(["oneTime", "duration", "permanent"]),
		id: z.string(),
	});
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			price: 0,
			duration: 0,
			multiplier: 1,
			type,
			id: nanoid(15),
		},
	});

	const submit = async (data: z.infer<typeof formSchema>) => {
		toast.promise(mutateAsync(data), {
			loading: (
				<div className="flex items-center justify-between">
					<Loader2 className="size-4 animate-spin" /> <p>Creating booster...</p>
				</div>
			),
			success: (res) => {
				if (res.error) {
					return res.error;
				}
				form.reset();
				setOpen(false);
				return res.message;
			},
			error: (error) =>
				error instanceof Error ? error.message : "Internal server error",
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger className={cn(buttonVariants(), "place-self-end mr-4")}>
				Create booster
			</DialogTrigger>
			<DialogContent className="max-w-sm">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(submit)} className="grid gap-4">
						<FormField
							name="name"
							label="Booster Name"
							render={({ field }) => (
								<Input {...field} placeholder="Booster name" required />
							)}
						/>
						<FormField
							name="description"
							label="Booster Description"
							render={({ field }) => (
								<Textarea
									{...field}
									placeholder="Booster description"
									required
								/>
							)}
						/>
						<FormField
							name="price"
							label="Booster Price in SOL"
							render={({ field }) => (
								<Input
									{...field}
									placeholder="Booster price"
									type="number"
									required
								/>
							)}
						/>
						<div className="grid gap-2">
							<Label>Booster type</Label>
							<RadioGroup required>
								<div className="flex items-center gap-2">
									<RadioGroupItem
										value="oneTime"
										onClick={() => {
											setType("oneTime");
											form.setValue("type", "oneTime");
										}}
									/>
									<Label>One time</Label>
								</div>
								<div className="flex items-center gap-2">
									<RadioGroupItem
										value="duration"
										onClick={() => {
											setType("duration");
											form.setValue("type", "duration");
										}}
									/>
									<Label>Duration</Label>
								</div>
								<div className="flex items-center gap-2">
									<RadioGroupItem
										value="permanent"
										onClick={() => {
											setType("permanent");
											form.setValue("type", "permanent");
										}}
									/>
									<Label>Permanent</Label>
								</div>
							</RadioGroup>
						</div>
						{type === "duration" && (
							<FormField
								name="duration"
								label="Booster Duration (in seconds)"
								render={({ field }) => (
									<Input
										{...field}
										placeholder="Booster duration"
										type="number"
										required
									/>
								)}
							/>
						)}
						<FormField
							name="multiplier"
							label="Booster multiplier"
							render={({ field }) => (
								<Input {...field} placeholder="Booster multiplier" required />
							)}
						/>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Creating..." : "Create Booster"}
						</Button>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
