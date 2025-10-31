import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@/components/auth/SignIn";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { authClient } from "@/utils/auth-client";

export const Route = createFileRoute("/")({
	component: App,
	loader: async (opts) => {
		const queryClient = opts.context.queryClient;
		const request =
			"request" in opts ? (opts as { request?: Request }).request : undefined;

		const { auth } = await import("@/utils/auth");

		const headers = request?.headers ?? new Headers();
		const session = await auth.api.getSession({ headers });
		if (!session?.user) {
			// Clear any stale dashboard data when a user signs out so the query
			// cache doesn't leak the last authenticated response.
			queryClient.removeQueries({ queryKey: ["fpl-dashboard"] });
			return { dashboardData: null };
		}

		const dashboardUrl = request
			? new URL("/api/fpl-dashboard", request.url).toString()
			: "/api/fpl-dashboard";
		const dashboardRes = await fetch(dashboardUrl, {
			headers: request?.headers,
		});
		if (!dashboardRes.ok) {
			return { dashboardData: null };
		}

		const dashboardData = await dashboardRes.json();
		queryClient.setQueryData(["fpl-dashboard"], dashboardData);
		return { dashboardData } as const;
	},
});

function App() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div>Loading...</div>
			</div>
		);
	}

	if (session?.user) {
		return (
			<div className="flex flex-col gap-4">
				<Dashboard />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="w-full max-w-md mx-auto">
				<h1 className="text-3xl font-bold text-center mb-8">Welcome!</h1>
				<SignIn />
			</div>
		</div>
	);
}
