import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { userTeamData } from "@/db/schema";
import type {
	FplBootstrapPlayer,
	FplRosterPlayer,
	FplTeamPick,
} from "@/types/fpl";
import { PREMIER_LEAGUE_TEAMS } from "@/types/teams";
import { auth } from "@/utils/auth";
import { getUserFplData } from "@/utils/user-fpl";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to get team name by ID
function getTeamName(teamId: number): string {
	const team = PREMIER_LEAGUE_TEAMS.find((t) => t.id === teamId);
	return team?.shortName || `Team ${teamId}`;
}

// Helper function to convert position number to string
function getPositionName(elementType: number): "GKP" | "DEF" | "MID" | "FWD" {
	switch (elementType) {
		case 1:
			return "GKP";
		case 2:
			return "DEF";
		case 3:
			return "MID";
		case 4:
			return "FWD";
		default:
			return "MID"; // fallback
	}
}

// Helper function to convert price from 0.1 units to actual price
function convertPrice(nowCost: number): number {
	return nowCost / 10;
}

export const Route = createFileRoute("/api/fpl-roster")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					// Get session from request headers
					const session = await auth.api.getSession({
						headers: request.headers,
					});

					if (!session?.user) {
						return Response.json({ error: "Unauthorized" }, { status: 401 });
					}

					const userFplData = await getUserFplData(session.user.id);

					if (!userFplData?.fplTeamId) {
						return Response.json({
							roster: [],
							needsSetup: true,
							message: "No FPL team connected. Please update your profile.",
						});
					}

					const { fplTeamId, rosterCache, rosterCacheUpdatedAt } = userFplData;
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

					// Fetch base data from FPL API
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

					// Create a map of player data for quick lookup
					const playerMap = new Map<number, FplBootstrapPlayer>();
					players.forEach((player) => {
						playerMap.set(player.id, player);
					});

					// Combine data to create roster
					const roster: FplRosterPlayer[] = picks.map((pick) => {
						const player = playerMap.get(pick.element);
						if (!player) {
							throw new Error(`Player with ID ${pick.element} not found`);
						}

						return {
							id: player.id,
							name: player.web_name,
							team: getTeamName(player.team),
							position: getPositionName(player.element_type),
							price: convertPrice(player.now_cost),
							totalPoints: player.total_points,
							form: parseFloat(player.form) || 0,
							pointsPerGame: parseFloat(player.points_per_game) || 0,
							expectedPoints: parseFloat(player.expected_points) || 0,
							isCaptain: pick.is_captain,
							isViceCaptain: pick.is_vice_captain,
							multiplier: pick.multiplier,
							status: player.status,
							news: player.news,
						chanceOfPlayingNextRound:
							player.chance_of_playing_next_round ?? null,
						};
					});

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
