import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { retrieveRawInitData } from "@telegram-apps/sdk-react";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useEffect, useState } from "react";
import superjson from "superjson";
import type { AppRouter } from "./router";
import logo from "~/assets/logo.png";

// Dynamic imports for browser-only components
let ConnectKitProvider: any;
let getDefaultConfig: any;
let WagmiProvider: any;
let createConfig: any;
let http: any;
let mainnet: any;

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

const createTRPCLinks = () => [
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

// Create a client-side only version of the client
export const createClientSideTRPCClient = () => {
	return createTRPCClient<AppRouter>({
		links: createTRPCLinks(),
	});
};

// Fallback client for SSR (with minimal functionality)
export const client =
	typeof window !== "undefined"
		? createClientSideTRPCClient()
		: createTRPCClient<AppRouter>({
				links: [
					httpBatchLink({
						transformer: superjson,
						url: "/api/trpc",
						headers: () => new Headers(),
					}),
				],
			});

// Client-side wrapper component
function ClientSideProviders({ children }: { children: React.ReactNode }) {
	const [isLoaded, setIsLoaded] = useState(false);
	const [wagmiConfig, setWagmiConfig] = useState<any>(null);

	useEffect(() => {
		const loadWagmiAndConnectKit = async () => {
			try {
				// Dynamic imports to avoid SSR issues
				const [
					{ ConnectKitProvider: CKProvider, getDefaultConfig: getConfig },
					{ WagmiProvider: WProvider, createConfig: cConfig },
					{ http: httpTransport },
					{ mainnet: mainnetChain },
				] = await Promise.all([
					import("connectkit"),
					import("wagmi"),
					import("wagmi"),
					import("wagmi/chains"),
				]);

				ConnectKitProvider = CKProvider;
				getDefaultConfig = getConfig;
				WagmiProvider = WProvider;
				createConfig = cConfig;
				http = httpTransport;
				mainnet = mainnetChain;

				const config = createConfig(
					getDefaultConfig({
						chains: [mainnet],
						transports: {
							[mainnet.id]: http(
								`https://eth-mainnet.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`,
							),
						},
						// Required API Keys
						walletConnectProjectId: import.meta.env.VITE_FAMILY_PROJECT_ID,
						// Required App Info
						appName: "Galaxy MEV",
					}),
				);

				setWagmiConfig(config);
				setIsLoaded(true);
			} catch (error) {
				console.error("Failed to load Web3 providers:", error);
				setIsLoaded(true); // Still set to true to render children without Web3
			}
		};

		loadWagmiAndConnectKit();
	}, []);

	if (!isLoaded) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="flex flex-col items-center space-y-4">
					<img
						src={logo}
						alt="Logo"
						className="size-24 rounded-full animate-spin"
					/>
					<p className="text-lg">Connected, setting up...</p>
				</div>
			</div>
		);
	}

	if (wagmiConfig && WagmiProvider && ConnectKitProvider) {
		return (
			<WagmiProvider config={wagmiConfig}>
				<ConnectKitProvider>{children}</ConnectKitProvider>
			</WagmiProvider>
		);
	}

	// Fallback if Web3 providers failed to load
	return <>{children}</>;
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() => {
		if (typeof window !== "undefined") {
			return createClientSideTRPCClient();
		}
		// SSR fallback
		return createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					transformer: superjson,
					url: "/api/trpc",
					headers: () => new Headers(),
				}),
			],
		});
	});

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{typeof window !== "undefined" ? (
					<ClientSideProviders>{children}</ClientSideProviders>
				) : (
					children
				)}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
