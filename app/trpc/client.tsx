import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { retrieveRawInitData } from "@telegram-apps/sdk-react";
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

let browserQueryClient: QueryClient | undefined;

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
			// Only try to get init data on client side
			if (typeof window !== "undefined") {
				try {
					const initData = retrieveRawInitData();
					headers.set("Authorization", `tma ${initData}`);
				} catch (e) {
					console.warn("Failed to retrieve Telegram init data:", e);
				}
			}
			return headers;
		},
	}),
];

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
