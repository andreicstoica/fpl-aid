import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db/index";
import { recommendationsCache } from "@/db/schema";
import crypto from "crypto";

export type CacheKey = {
	userId: string;
	leagueId: string | null;
	gameweek: number;
	contextHash: string;
};

export function computeContextHash(input: unknown): string {
	const serialized = JSON.stringify(input);
	return crypto.createHash("sha256").update(serialized).digest("hex");
}

export async function readRecommendationsCache(key: CacheKey) {
	const rows = await db
		.select()
		.from(recommendationsCache)
		.where(
			and(
				eq(recommendationsCache.userId, key.userId),
				key.leagueId === null
					? isNull(recommendationsCache.leagueId)
					: eq(recommendationsCache.leagueId, key.leagueId),
				eq(recommendationsCache.gameweek, key.gameweek),
				eq(recommendationsCache.contextHash, key.contextHash),
			),
		);
	const row = rows[0];
	if (!row) return null;
	if (row.expiresAt && new Date(row.expiresAt).getTime() <= Date.now())
		return null;
	return row.payload as unknown;
}

export async function writeRecommendationsCache(
	key: CacheKey,
	payload: unknown,
	expiresAt: Date,
) {
	await db
		.insert(recommendationsCache)
		.values({
			userId: key.userId,
			leagueId: key.leagueId ?? null,
			gameweek: key.gameweek,
			contextHash: key.contextHash,
			payload: payload as object,
			createdAt: new Date(),
			expiresAt,
		})
		.onConflictDoUpdate({
			target: [
				recommendationsCache.userId,
				recommendationsCache.leagueId,
				recommendationsCache.gameweek,
				recommendationsCache.contextHash,
			],
			set: {
				payload: payload as object,
				createdAt: new Date(),
				expiresAt,
			},
		});
}
