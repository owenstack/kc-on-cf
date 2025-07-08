import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/trpc/router";
import { createContext } from "~/trpc/utils";
import type { Route } from "./+types/api.trpc.$";

export async function loader(args: Route.LoaderArgs) {
	return handler(args);
}

export async function action(args: Route.ActionArgs) {
	return handler(args);
}

function handler(args: Route.LoaderArgs | Route.ActionArgs) {
	return fetchRequestHandler({
		endpoint: "/api/trpc",
		req: args.request,
		router: appRouter,
		createContext: () =>
			createContext({
				headers: args.request.headers,
			}),
	});
}
