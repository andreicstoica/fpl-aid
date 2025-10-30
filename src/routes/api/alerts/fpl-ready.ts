import { createFileRoute } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { eq, isNotNull } from "drizzle-orm";
import { db } from "@/db/index";
import { user, userTeamData } from "@/db/schema";
import type { FplBootstrapPlayer } from "@/types/fpl";
import { assessPlayerRisk, type PlayerRiskInfo } from "@/lib/fpl/playerRisk";
import { getCurrentWindow } from "@/lib/alerts/scheduling";

const DEFAULT_WINDOW_HOURS = 14;
const ALERT_SECRET_HEADER = "x-alert-secret";

interface AlertRecipient {
	userId: string;
	email: string;
	players: PlayerRiskInfo[];
}

interface AlertResponse {
	gameweek: number;
	deadlineUtc: string;
	window: {
		startUtc: string;
		endUtc: string;
	};
	recipients: AlertRecipient[];
}

// getTeamName removed (unused)

export const Route = createFileRoute("/api/alerts/fpl-ready")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				try {
					// Auth check: verify secret header
					const secret = request.headers.get(ALERT_SECRET_HEADER);
					const expectedSecret = process.env.ALERT_WEBHOOK_SHARED_SECRET;
					if (!expectedSecret || secret !== expectedSecret) {
						return Response.json({ error: "Unauthorized" }, { status: 401 });
					}

					// Parse query params
					const url = new URL(request.url);
					const gwParam = url.searchParams.get("gw");
					const nowParam = url.searchParams.get("now");
					const windowHoursParam = url.searchParams.get("windowHours");

					const windowHours = windowHoursParam
						? Number.parseInt(windowHoursParam, 10)
						: DEFAULT_WINDOW_HOURS;
					if (Number.isNaN(windowHours) || windowHours <= 0) {
						return Response.json(
							{ error: "Invalid windowHours parameter" },
							{ status: 400 },
						);
					}

					const now = nowParam ? DateTime.fromISO(nowParam) : DateTime.utc();
					if (!now.isValid) {
						return Response.json(
							{ error: "Invalid now parameter (use ISO format)" },
							{ status: 400 },
						);
					}

					// Fetch bootstrap to get current gameweek and deadline
					const bootstrapResponse = await fetch(
						"https://fantasy.premierleague.com/api/bootstrap-static/",
					);
					if (!bootstrapResponse.ok) {
						throw new Error("Failed to fetch bootstrap data from FPL API");
					}

					const bootstrapData = await bootstrapResponse.json();
					const currentEvent =
						bootstrapData.events?.find(
							(e: { is_current?: boolean }) => e?.is_current,
						) ?? bootstrapData.events?.[0];

					if (!currentEvent) {
						return Response.json(
							{ error: "Unable to determine current gameweek" },
							{ status: 500 },
						);
					}

					const gameweekId = gwParam
						? Number.parseInt(gwParam, 10)
						: currentEvent.id;
					const deadlineISO = currentEvent.deadline_time;
					const deadlineEpochMs = new Date(deadlineISO).getTime();

					// Compute window
					const window = getCurrentWindow(now, deadlineEpochMs, windowHours);

					// Load all users with FPL team data
					const users = await db
						.select({
							id: user.id,
							email: user.email,
							userId: userTeamData.userId,
							fplTeamId: userTeamData.fplTeamId,
						})
						.from(user)
						.innerJoin(userTeamData, eq(user.id, userTeamData.userId))
						.where(isNotNull(userTeamData.fplTeamId));

					if (users.length === 0) {
						return Response.json({
							gameweek: gameweekId,
							deadlineUtc: deadlineISO,
							window: {
								startUtc: window.startUtc.toISO() ?? window.startUtc.toString(),
								endUtc: window.endUtc.toISO() ?? window.endUtc.toString(),
							},
							recipients: [],
						} satisfies AlertResponse);
					}

					// Fetch roster data for each user
					const recipients: AlertRecipient[] = [];

					for (const userRow of users) {
						if (!userRow.fplTeamId) continue;

						try {
							// Fetch user's picks for current gameweek
							const picksResponse = await fetch(
								`https://fantasy.premierleague.com/api/entry/${userRow.fplTeamId}/event/${gameweekId}/picks/`,
							);

							if (!picksResponse.ok) continue;

							const picksData = await picksResponse.json();
							const picks = picksData?.picks || [];

							if (picks.length === 0) continue;

							// Build player map
							const players: FplBootstrapPlayer[] =
								bootstrapData.elements || [];
							const playerMap = new Map<number, FplBootstrapPlayer>();
							players.forEach((player) => {
								playerMap.set(player.id, player);
							});

							// Assess risk for each picked player
							const playerRisks: PlayerRiskInfo[] = [];
							for (const pick of picks) {
								const player = playerMap.get(pick.element);
								if (!player) continue;

								const risk = assessPlayerRisk(player);
								// Only include players with risk (not "ok")
								if (risk.badge !== "ok") {
									playerRisks.push(risk);
								}
							}

							// Only add recipient if they have players at risk
							if (playerRisks.length > 0) {
								recipients.push({
									userId: userRow.id,
									email: userRow.email,
									players: playerRisks,
								});
							}
						} catch (error) {
							console.error(`Error processing user ${userRow.id}:`, error);
						}
					}

					return Response.json({
						gameweek: gameweekId,
						deadlineUtc: deadlineISO,
						window: {
							startUtc: window.startUtc.toISO() ?? window.startUtc.toString(),
							endUtc: window.endUtc.toISO() ?? window.endUtc.toString(),
						},
						recipients,
					} satisfies AlertResponse);
				} catch (error) {
					console.error("FPL alerts API error:", error);
					return Response.json(
						{ error: "Internal server error" },
						{ status: 500 },
					);
				}
			},
		},
	},
});
