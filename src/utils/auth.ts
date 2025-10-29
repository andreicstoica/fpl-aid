import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { db } from "@/db/index"; // your drizzle instance
import { userTeamData } from "@/db/schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),

	trustedOrigins: [process.env.ORIGIN ?? "http://localhost:3000"],

	emailAndPassword: {
		enabled: true,
	},

	plugins: [
		customSession(async ({ user, session }) => {
			// Fetch user's FPL team data
			const teamData = await db
				.select()
				.from(userTeamData)
				.where(eq(userTeamData.userId, user.id))
				.limit(1);

			return {
				user: {
					...user,
					fplTeamId: teamData[0]?.fplTeamId || null,
					fplLeagueId: teamData[0]?.fplLeagueId || null,
					favoriteTeam: teamData[0]?.favoriteTeam || null,
				},
				session,
			};
		}),
	],
});
