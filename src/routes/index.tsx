import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@/components/auth/SignIn";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { authClient } from "@/utils/auth-client";

export const Route = createFileRoute("/")({
	component: App,
	loader: async (opts) => {
		const { auth } = await import("@/utils/auth");
		const {
			computeContextHash,
			readRecommendationsCache,
			writeRecommendationsCache,
		} = await import("@/lib/fpl/cache");
		const { WEIGHTS_VERSION, RECOMMENDATIONS_TTL_MS } = await import(
			"@/lib/fpl/config"
		);
		const { computeRecommendations } = await import(
			"@/lib/fpl/recommendations"
		);

		const request = (opts as unknown as { request?: Request })?.request;
		const headers = request?.headers ?? new Headers();
		const session = await auth.api.getSession({ headers });
		if (!session?.user) return { recommendations: null } as const;

		const dashboardUrl = request
			? new URL("/api/fpl-dashboard", request.url).toString()
			: "/api/fpl-dashboard";
		const [dashboardRes, bootstrapRes] = await Promise.all([
			fetch(dashboardUrl, { headers: request?.headers }),
			fetch("https://fantasy.premierleague.com/api/bootstrap-static/"),
		]);
		if (!dashboardRes.ok || !bootstrapRes.ok)
			return { recommendations: null } as const;
		const dashboardData = await dashboardRes.json();
		const bootstrapData = await bootstrapRes.json();

		const roster = Array.isArray(dashboardData?.roster)
			? dashboardData.roster
			: [];
		if (roster.length === 0) return { recommendations: null } as const;

		type BootstrapElement = {
			id: number;
			web_name: string;
			team: number;
			element_type: number;
			now_cost: number;
			form: string;
			points_per_game: string;
			ep_next?: string;
			ep_this?: string;
		};
		const allPlayers = (bootstrapData?.elements || []).map((e: BootstrapElement) => ({
			id: e.id,
			name: e.web_name,
			team: String(e.team),
			position: (() => {
				switch (e.element_type) {
					case 1:
						return "GKP" as const;
					case 2:
						return "DEF" as const;
					case 3:
						return "MID" as const;
					default:
						return "FWD" as const;
				}
			})(),
			price: (e.now_cost || 0) / 10,
			form: parseFloat(e.form || "0") || 0,
			pointsPerGame: parseFloat(e.points_per_game || "0") || 0,
			expectedPoints: parseFloat(e.ep_next || e.ep_this || "0") || 0,
		}));

		const context = {
			w: WEIGHTS_VERSION,
			roster: roster.map((p: { id: number; price: number }) => ({ id: p.id, price: p.price })),
			stamp: new Date().toDateString(),
		};
		const contextHash = computeContextHash(context);
		const key = {
			userId: session.user.id,
			leagueId: null,
			gameweek: dashboardData?.manager?.currentGameweek || 0,
			contextHash,
		};

		const cached = await readRecommendationsCache(key);
		if (cached) return { recommendations: cached } as const;

		const recs = computeRecommendations(roster, allPlayers);
		const expiresAt = new Date(Date.now() + RECOMMENDATIONS_TTL_MS);
		await writeRecommendationsCache(key, recs, expiresAt);
		return { recommendations: recs } as const;
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
