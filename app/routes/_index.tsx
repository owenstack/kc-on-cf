import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { useTRPC } from "~/trpc/client";

export default function Index() {
	const trpc = useTRPC();
	const { data, error, isPending } = useQuery(trpc.public.hello.queryOptions());
	if (error) {
		toast.error("Something went wrong", {
			description: error.message,
		});
	}
	return (
		<main className="flex flex-col items-center justify-center h-screen">
			This is the homepage
			{isPending ? <Skeleton className="w-32 h-8" /> : <h1>{data}</h1>}
		</main>
	);
}
