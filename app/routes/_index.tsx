import { auth } from "~/lib/auth";
import { caller } from "~/trpc/utils";
import type { Route } from "./+types/_index";

export async function loader(args: Route.LoaderArgs) {
	const api = caller(args);
	const authz = await auth.api.getSession({ headers: args.request.headers });
	const hello = await (await api).public.hello(authz?.user.name);
	return { message: hello, user: authz?.user };
}

export default function Index({ loaderData }: Route.ComponentProps) {
	const { message, user } = loaderData;
	return (
		<main className="flex flex-col items-center justify-center h-screen">
			This is the homepage
			<h1>{message}</h1>
			{!user && "Sign in to continue"}
		</main>
	);
}
