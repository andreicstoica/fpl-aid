import type { FplRosterPlayer } from "@/types/fpl";
import { evaluateCandidate } from "@/lib/fpl/metrics/evaluate";
import { MAX_RECOMMENDATIONS, DIFFERENTIAL_MIN_SCORE } from "@/lib/fpl/config";
import { buildCandidatePool, selectSwapOut } from "@/lib/fpl/adapters";

export interface RecommendationItem {
	in: FplRosterPlayer;
	out: FplRosterPlayer;
	score: number;
	rationale: string;
}

export interface RecommendationsPayload {
	items: RecommendationItem[];
}

export function computeRecommendations(
	roster: FplRosterPlayer[],
	allPlayers: Array<
		Pick<
			FplRosterPlayer,
			| "id"
			| "name"
			| "team"
			| "position"
			| "price"
			| "form"
			| "pointsPerGame"
			| "expectedPoints"
		>
	>,
): RecommendationsPayload {
	const pool = buildCandidatePool(roster, allPlayers);
	const out = selectSwapOut(roster);

	const ranked = pool
		.map((c) => {
			const { score, scores } = evaluateCandidate(c as FplRosterPlayer);
			return {
				candidate: c as FplRosterPlayer,
				score,
				rationale: `formΔ:${scores.formDelta.toFixed(2)} xpΔ:${scores.expectedPointsDelta.toFixed(
					2,
				)} fix:${scores.fixtureEase.toFixed(2)} val:${scores.valueSignal.toFixed(2)}`,
			};
		})
		.filter((r) => r.score >= DIFFERENTIAL_MIN_SCORE)
		.sort((a, b) => b.score - a.score)
		.slice(0, MAX_RECOMMENDATIONS);

	return {
		items: ranked.map((r) => ({
			in: r.candidate,
			out,
			score: r.score,
			rationale: r.rationale,
		})),
	};
}
