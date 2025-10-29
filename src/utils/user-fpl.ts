import { eq, type InferSelectModel } from "drizzle-orm";
import { db } from "@/db/index";
import { userTeamData } from "@/db/schema";

export type UserFplData = InferSelectModel<typeof userTeamData>;

// Utility function to get user's FPL data
export async function getUserFplData(
	userId: string,
): Promise<UserFplData | null> {
	const teamData = await db
		.select()
		.from(userTeamData)
		.where(eq(userTeamData.userId, userId))
		.limit(1);

	return teamData[0] || null;
}
