import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { userTeamData } from "@/db/schema";
import { buildRoster } from "@/lib/fpl/transformers";
import type {
	FplBootstrapPlayer,
	FplRosterPlayer,
	FplTeamPick,
} from "@/types/fpl";
import { auth } from "@/utils/auth";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const Route = createFileRoute("/api/fpl-roster")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					const session = await auth.api.getSession({
						headers: request.headers,
					});

					if (!session?.user) {
						return Response.json({ error: "Unauthorized" }, { status: 401 });
					}

					const fplTeamId = session.user.fplTeamId;

					if (!fplTeamId) {
						return Response.json({
							roster: [],
							needsSetup: true,
							message: "No FPL team connected. Please update your profile.",
						});
					}

					const [userTeamRow] = await db
						.select({
							rosterCache: userTeamData.rosterCache,
							rosterCacheUpdatedAt: userTeamData.rosterCacheUpdatedAt,
						})
						.from(userTeamData)
						.where(eq(userTeamData.userId, session.user.id))
						.limit(1);

					const { rosterCache = null, rosterCacheUpdatedAt = null } =
						userTeamRow ?? {};
					const cacheTimestamp = rosterCacheUpdatedAt
						? new Date(rosterCacheUpdatedAt)
						: null;
					const canUseCache =
						Array.isArray(rosterCache) &&
						cacheTimestamp !== null &&
						Date.now() - cacheTimestamp.getTime() < CACHE_TTL;

					if (canUseCache) {
						return Response.json({ roster: rosterCache as FplRosterPlayer[] });
					}

					const [bootstrapResponse, teamResponse] = await Promise.all([
						fetch("https://fantasy.premierleague.com/api/bootstrap-static/"),
						fetch(`https://fantasy.premierleague.com/api/entry/${fplTeamId}/`),
					]);

					if (!bootstrapResponse.ok || !teamResponse.ok) {
						throw new Error("Failed to fetch from FPL API");
					}

					const bootstrapData = await bootstrapResponse.json();
					const teamData = await teamResponse.json();

					const currentEvent =
						teamData?.current_event ??
						bootstrapData?.events?.find(
							(event: { is_current?: boolean }) => event?.is_current,
						)?.id;

					if (!currentEvent) {
						throw new Error(
							"Unable to determine current gameweek for roster fetch",
						);
					}

					const picksResponse = await fetch(
						`https://fantasy.premierleague.com/api/entry/${fplTeamId}/event/${currentEvent}/picks/`,
					);

					if (!picksResponse.ok) {
						throw new Error("Failed to fetch team picks from FPL API");
					}

					const picksData = await picksResponse.json();

					// Get players and picks
					const players: FplBootstrapPlayer[] = bootstrapData.elements;
					const picks: FplTeamPick[] = Array.isArray(picksData?.picks)
						? picksData.picks
						: [];

					if (picks.length === 0) {
						return Response.json({
							roster: [],
							message: "No picks returned for the current gameweek.",
						});
					}

					const roster: FplRosterPlayer[] = buildRoster({ picks, players });

					await db
						.update(userTeamData)
						.set({
							rosterCache: roster,
							rosterCacheUpdatedAt: new Date(),
						})
						.where(eq(userTeamData.userId, session.user.id));

					return Response.json({ roster });
				} catch (error) {
					console.error("FPL roster API error:", error);
					return Response.json(
						{ error: "Failed to fetch roster data" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
