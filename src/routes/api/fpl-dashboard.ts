import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { userTeamData } from "@/db/schema";
import { computeRecommendations } from "@/lib/fpl/recommendations";
import {
	buildRoster,
	calculateAvgPointsPerWeek,
	convertPrice,
	getPositionName,
	getTeamName,
} from "@/lib/fpl/transformers";
import type {
	FplBootstrapPlayer,
	FplDashboardData,
	FplManagerStats,
	FplRosterPlayer,
	FplTeamPick,
	LeagueComparison,
} from "@/types/fpl";
import { auth } from "@/utils/auth";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const Route = createFileRoute("/api/fpl-dashboard")({
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
					const fplLeagueId = session.user.fplLeagueId;

					if (!fplTeamId || !fplLeagueId) {
						return Response.json({
							roster: [],
							manager: null,
							league: null,
							needsSetup: true,
							message:
								"No FPL team or league connected. Please update your profile.",
						});
					}

					const [userTeamRow] = await db
						.select({
							dashboardCache: userTeamData.dashboardCache,
							dashboardCacheUpdatedAt: userTeamData.dashboardCacheUpdatedAt,
						})
						.from(userTeamData)
						.where(eq(userTeamData.userId, session.user.id))
						.limit(1);

					const { dashboardCache = null, dashboardCacheUpdatedAt = null } =
						userTeamRow ?? {};
					const cacheTimestamp = dashboardCacheUpdatedAt
						? new Date(dashboardCacheUpdatedAt)
						: null;
					const canUseCache =
						dashboardCache !== null &&
						cacheTimestamp !== null &&
						Date.now() - cacheTimestamp.getTime() < CACHE_TTL;

					if (canUseCache) {
						return Response.json(dashboardCache as FplDashboardData);
					}

					const [bootstrapResponse, teamResponse, leagueResponse] =
						await Promise.all([
							fetch("https://fantasy.premierleague.com/api/bootstrap-static/"),
							fetch(
								`https://fantasy.premierleague.com/api/entry/${fplTeamId}/`,
							),
							fetch(
								`https://fantasy.premierleague.com/api/leagues-classic/${fplLeagueId}/standings/`,
							),
						]);

					if (!bootstrapResponse.ok || !teamResponse.ok || !leagueResponse.ok) {
						throw new Error("Failed to fetch from FPL API");
					}

					const bootstrapData = await bootstrapResponse.json();
					const teamData = await teamResponse.json();
					const leagueData = await leagueResponse.json();

					const currentEvent =
						teamData?.current_event ??
						bootstrapData?.events?.find(
							(event: { is_current?: boolean }) => event?.is_current,
						)?.id;

					if (!currentEvent) {
						throw new Error("Unable to determine current gameweek");
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
							manager: null,
							league: null,
							message: "No picks returned for the current gameweek.",
						});
					}

					const roster: FplRosterPlayer[] = buildRoster({ picks, players });

					const manager: FplManagerStats = {
						totalPoints: teamData.summary_overall_points || 0,
						currentGameweek: currentEvent,
						transfersRemaining: teamData.transfers?.limit || 0,
						bankBalance: (teamData.last_deadline_bank || 0) / 10, // Convert from 0.1 units
						squadValue: (teamData.last_deadline_value || 0) / 10, // Convert from 0.1 units
					};

					const standings = leagueData?.standings?.results || [];
					const userStanding = standings.find(
						(s: { entry: number }) => s.entry === parseInt(fplTeamId, 10),
					);

					let league: LeagueComparison | null = null;
					if (userStanding) {
						const userRank = userStanding.rank;
						const userPoints = userStanding.total;
						const userAvgPPW = calculateAvgPointsPerWeek(
							userPoints,
							currentEvent,
						);

						// Find the manager directly above (lower rank number = better position)
						const rivalAbove = standings.find(
							(s: { rank: number }) => s.rank === userRank - 1,
						);

						if (rivalAbove) {
							const rivalPoints = rivalAbove.total;
							const rivalAvgPPW = calculateAvgPointsPerWeek(
								rivalPoints,
								currentEvent,
							);
							const ppwGap = userAvgPPW - rivalAvgPPW;

							league = {
								userRank,
								rivalAbove: {
									name: rivalAbove.player_name,
									points: rivalPoints,
									avgPointsPerWeek: rivalAvgPPW,
								},
								pointsGap: rivalPoints - userPoints,
								ppwGap,
								userAvgPointsPerWeek: userAvgPPW,
							};
						} else {
							// User is first place
							league = {
								userRank,
								rivalAbove: {
									name: "League Leader",
									points: userPoints,
									avgPointsPerWeek: userAvgPPW,
								},
								pointsGap: 0,
								ppwGap: 0,
								userAvgPointsPerWeek: userAvgPPW,
							};
						}
					}

					const allPlayers = players.map((player) => ({
						id: player.id,
						name: player.web_name,
						team: getTeamName(player.team),
						position: getPositionName(player.element_type),
						price: convertPrice(player.now_cost),
						form: parseFloat(player.form || "0") || 0,
						pointsPerGame: parseFloat(player.points_per_game || "0") || 0,
						expectedPoints:
							parseFloat(player.ep_next || player.ep_this || "0") || 0,
					}));

					const recs = computeRecommendations(roster, allPlayers);

					const dashboardData: FplDashboardData = {
						roster,
						manager,
						league: league || {
							userRank: 0,
							rivalAbove: {
								name: "Unknown",
								points: 0,
								avgPointsPerWeek: 0,
							},
							pointsGap: 0,
							ppwGap: 0,
							userAvgPointsPerWeek: 0,
						},
						recommendations: recs.items,
					};

					await db
						.update(userTeamData)
						.set({
							dashboardCache: dashboardData,
							dashboardCacheUpdatedAt: new Date(),
						})
						.where(eq(userTeamData.userId, session.user.id));

					return Response.json(dashboardData);
				} catch (error) {
					console.error("FPL dashboard API error:", error);
					return Response.json(
						{ error: "Failed to fetch dashboard data" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
