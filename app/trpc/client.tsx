import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "./router";

function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	});
}
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

const getBaseUrl = () => {
	if (typeof window !== "undefined") {
		// Browser should use relative URL
		return "";
	}
	if (import.meta.env.DEV) {
		// Local dev on wrangler/localhost
		return "http://localhost:8787";
	}
	// Fallback for SSR/Workers – let runtime set this
	return undefined;
};
const links = [
	loggerLink({
		enabled: (op) =>
			import.meta.env.DEV ||
			(op.direction === "down" && op.result instanceof Error),
	}),
	httpBatchLink({
		transformer: superjson,
		url: getBaseUrl() ? `${getBaseUrl()}/api/trpc` : "/api/trpc",
		headers() {
			const headers = new Headers();
			headers.set("x-trpc-source", "react");
			return headers;
		},
	}),
];
export const client = createTRPCClient<AppRouter>({
	links,
});

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links,
		}),
	);
	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
