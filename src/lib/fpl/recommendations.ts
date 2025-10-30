import type { FplRosterPlayer } from "@/types/fpl";
import { evaluateCandidate } from "@/lib/fpl/metrics/evaluate";
import {
	MAX_RECOMMENDATIONS,
	DIFFERENTIAL_MIN_SCORE,
	metricWeights,
} from "@/lib/fpl/config";
import { buildCandidatePool, selectSwapOut } from "@/lib/fpl/adapters";
import { normalize } from "@/lib/fpl/trends";

export interface RecommendationItem {
	in: FplRosterPlayer;
	out: FplRosterPlayer;
	score: number;
	rationale: string;
	weeklyPointsDelta: number;
	nextFixtureExpectedDelta: number;
	valuePerMillion: number;
	netSpend: number;
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
	const out = selectSwapOut(roster);
	const pool = buildCandidatePool(roster, allPlayers, out.position);

	const ranked = pool
		.map((c) => {
			const { scores } = evaluateCandidate(c as FplRosterPlayer);
			// Baseline-relative weekly output using season average
			const weeklyDelta = (c.pointsPerGame || 0) - (out.pointsPerGame || 0);
			const weeklyDeltaNormalized = normalize(weeklyDelta + 5, 0, 10);
			// Next fixture FPL projected delta (for context)
			const nextFixtureDelta =
				(c.expectedPoints || 0) - (out.expectedPoints || 0);
			// Value impact per £m using IN price and weekly delta
			const valPerMillion = weeklyDelta / Math.max(0.1, c.price);
			const netSpend = c.price - out.price;
			// Recompute weighted score substituting our baseline-relative EP factor
			const score =
				metricWeights.formDelta * scores.formDelta +
				metricWeights.formTrend * scores.formTrend +
				metricWeights.expectedPointsDelta * weeklyDeltaNormalized +
				metricWeights.fixtureEase * scores.fixtureEase +
				metricWeights.valueSignal * scores.valueSignal;
			return {
				candidate: c as FplRosterPlayer,
				score,
				weeklyDelta,
				nextFixtureDelta,
				valPerMillion,
				netSpend,
				rationale: `formΔ:${scores.formDelta.toFixed(2)} ppgΔ:${weeklyDelta.toFixed(2)} gwXPΔ:${nextFixtureDelta.toFixed(2)} val:${valPerMillion.toFixed(2)}`,
			};
		})
		.filter((r) => r.weeklyDelta > 0)
		.filter((r) => r.score >= DIFFERENTIAL_MIN_SCORE)
		.sort((a, b) => b.score - a.score)
		.slice(0, MAX_RECOMMENDATIONS);

	return {
		items: ranked.map((r) => ({
			in: r.candidate,
			out,
			score: r.score,
			rationale: r.rationale,
			weeklyPointsDelta: r.weeklyDelta,
			nextFixtureExpectedDelta: r.nextFixtureDelta,
			valuePerMillion: r.valPerMillion,
			netSpend: r.netSpend,
		})),
	};
}
