import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { userTeamData } from "@/db/schema";
import { auth } from "@/utils/auth";

export const Route = createFileRoute("/api/update-user-settings")({
	server: {
		handlers: {
			POST: async ({ request }: { request: Request }) => {
				try {
					// Get current session
					const session = await auth.api.getSession({
						headers: request.headers,
					});

					if (!session?.user) {
						return Response.json({ error: "Unauthorized" }, { status: 401 });
					}

					// Parse request body
					const body = await request.json();
					const { fplTeamId, fplLeagueId } = body;

					if (!fplTeamId || !fplLeagueId) {
						return Response.json(
							{
								error: "Missing required fields: fplTeamId and fplLeagueId",
							},
							{ status: 400 },
						);
					}

					// Update user team data
					await db
						.update(userTeamData)
						.set({
							fplTeamId,
							fplLeagueId,
							// Clear cache to force refresh
							rosterCache: null,
							rosterCacheUpdatedAt: null,
							dashboardCache: null,
							dashboardCacheUpdatedAt: null,
							updatedAt: new Date(),
						})
						.where(eq(userTeamData.userId, session.user.id));

					return Response.json({
						success: true,
						message: "Settings updated successfully",
					});
				} catch (error) {
					console.error("Error updating user settings:", error);
					return Response.json(
						{
							error: "Internal server error",
							message: error instanceof Error ? error.message : "Unknown error",
						},
						{ status: 500 },
					);
				}
			},
		},
	},
});
