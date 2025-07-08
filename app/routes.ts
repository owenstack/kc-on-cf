import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
	// route("api/preview/enable", "routes/api/preview/enable.ts"),
	// route("api/preview/disable", "routes/api/preview/disable.ts"),
	route("server/set-theme", "routes/server/set-theme.ts"),
	...(await flatRoutes({})),
] satisfies RouteConfig;
