import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import {
	isColorDark,
	isRGB,
	retrieveLaunchParams,
} from "@telegram-apps/sdk-react";
import { TRPCReactProvider } from "~/trpc/client";
import { Toaster } from "./components/ui/sonner";
import { init } from "./lib/init";
import "./lib/mock-env";
import { useEffect, useState } from "react";
import { EnvUnsupported } from "./components/unsupported-env";
import logo from "~/assets/logo.png";

// export async function loader({ request }: Route.LoaderArgs) {
// 	const { getTheme } = await themeSessionResolver(request);
// 	return {
// 		theme: getTheme(),
// 	};
// }

export const links: Route.LinksFunction = () => {
	return [
		{
			rel: "icon",
			href: "/favicon.png",
			type: "image/png",
		},
	];
};

export default function AppWithProviders() {
	const [telegramData, setTelegramData] = useState<{
		platform: string;
		isDark: boolean;
		launchParamsError: Error | null;
	}>({
		platform: "android",
		isDark: false,
		launchParamsError: null,
	});

	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		// Only run on client side
		if (typeof window !== "undefined") {
			try {
				const lp = retrieveLaunchParams();
				const { bg_color: bgColor } = lp.tgWebAppThemeParams;
				setTelegramData({
					platform: lp.tgWebAppPlatform,
					isDark: bgColor && isRGB(bgColor) ? isColorDark(bgColor) : false,
					launchParamsError: null,
				});
			} catch (e) {
				setTelegramData({
					platform: "android",
					isDark: false,
					launchParamsError: e as Error,
				});
			}
			setIsInitialized(true);
		}
	}, []);

	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			!telegramData.launchParamsError &&
			isInitialized
		) {
			const initializeApp = async () => {
				try {
					const lp = retrieveLaunchParams();
					const debug =
						(lp.tgWebAppStartParam || "").includes("platformer_debug") ||
						import.meta.env.DEV;
					await init({
						debug,
						eruda: debug && ["ios", "android"].includes(telegramData.platform),
						mockForMacOS: telegramData.platform === "macos",
					});
				} catch (e) {
					console.error("Error initializing app:", e);
				}
			};
			initializeApp();
		}
	}, [telegramData.platform, telegramData.launchParamsError, isInitialized]);

	// Show loading state during SSR or before initialization
	if (typeof window === "undefined" || !isInitialized) {
		return (
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<Meta />
					<Links />
					<title>Loading...</title>
				</head>
				<body className="bg-background text-foreground">
					<div className="flex items-center justify-center min-h-screen">
						<img
							src={logo}
							alt="Logo"
							className="size-24 rounded-full animate-spin"
						/>
					</div>
					<ScrollRestoration />
					<Scripts />
				</body>
			</html>
		);
	}

	if (telegramData.launchParamsError) {
		console.error("Launch params error:", telegramData.launchParamsError);
		return (
			<html lang="en">
				<head>
					<title>Error</title>
				</head>
				<body>
					<EnvUnsupported />
				</body>
			</html>
		);
	}

	return (
		<TRPCReactProvider>
			<App />
		</TRPCReactProvider>
	);
}

export function App() {
	// const data = useLoaderData<typeof loader>();
	// const [theme] = useTheme();
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				{/* <PreventFlashOnWrongTheme ssrTheme={Boolean(data.theme)} /> */}
				<Links />
			</head>
			<body className="bg-background text-foreground">
				<Outlet />
				<Toaster richColors />
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details =
			error.status === 404
				? "The requested page could not be found."
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
