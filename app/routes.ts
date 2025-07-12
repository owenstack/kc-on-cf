import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
	index("routes/index.tsx"),
	route("/api/trpc/*", "routes/api/trpc.ts"),
	route("settings", "routes/settings.tsx"),
	route("admin", "routes/admin.tsx"),
] satisfies RouteConfig;
