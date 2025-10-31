import { buildCandidatePool, selectSwapOut } from "@/lib/fpl/adapters";
import {
	DIFFERENTIAL_MIN_SCORE,
	MAX_RECOMMENDATIONS,
	metricWeights,
} from "@/lib/fpl/config";
import { evaluateCandidate } from "@/lib/fpl/metrics/evaluate";
import { normalize } from "@/lib/fpl/trends";
import type { FplRosterPlayer, RecommendationsPayload } from "@/types/fpl";

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

	const ranked: Array<{
		candidate: FplRosterPlayer;
		score: number;
		weeklyDelta: number;
		nextFixtureDelta: number;
		valPerMillion: number;
		netSpend: number;
		rationale: string;
	}> = [];

	for (const candidate of pool) {
		const { scores } = evaluateCandidate(candidate as FplRosterPlayer);
		const weeklyDelta =
			(candidate.pointsPerGame || 0) - (out.pointsPerGame || 0);
		if (weeklyDelta <= 0) continue;

		const weeklyDeltaNormalized = normalize(weeklyDelta + 5, 0, 10);
		const nextFixtureDelta =
			(candidate.expectedPoints || 0) - (out.expectedPoints || 0);
		const valPerMillion = weeklyDelta / Math.max(0.1, candidate.price);
		const netSpend = candidate.price - out.price;
		const score =
			metricWeights.formDelta * scores.formDelta +
			metricWeights.formTrend * scores.formTrend +
			metricWeights.expectedPointsDelta * weeklyDeltaNormalized +
			metricWeights.fixtureEase * scores.fixtureEase +
			metricWeights.valueSignal * scores.valueSignal;

		if (score < DIFFERENTIAL_MIN_SCORE) continue;

		const entry = {
			candidate: candidate as FplRosterPlayer,
			score,
			weeklyDelta,
			nextFixtureDelta,
			valPerMillion,
			netSpend,
			rationale: `formΔ:${scores.formDelta.toFixed(2)} ppgΔ:${weeklyDelta.toFixed(2)} gwXPΔ:${nextFixtureDelta.toFixed(2)} val:${valPerMillion.toFixed(2)}`,
		};

		const insertIndex = ranked.findIndex((r) => entry.score > r.score);
		if (insertIndex === -1) {
			ranked.push(entry);
		} else {
			ranked.splice(insertIndex, 0, entry);
		}

		if (ranked.length > MAX_RECOMMENDATIONS) {
			ranked.length = MAX_RECOMMENDATIONS;
		}
	}

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
