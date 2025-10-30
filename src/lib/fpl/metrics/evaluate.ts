import type { FplRosterPlayer } from "@/types/fpl";
import { metricWeights } from "@/lib/fpl/config";
import { formDelta } from "@/lib/fpl/metrics/formDelta";
import { formTrend } from "@/lib/fpl/metrics/formTrend";
import { expectedPointsDelta } from "@/lib/fpl/metrics/expectedPointsDelta";
import { fixtureEase } from "@/lib/fpl/metrics/fixtureEase";
import { valueSignal } from "@/lib/fpl/metrics/valueSignal";

export function evaluateCandidate(candidate: FplRosterPlayer) {
	const scores = {
		formDelta: formDelta(candidate),
		formTrend: formTrend(candidate),
		expectedPointsDelta: expectedPointsDelta(candidate),
		fixtureEase: fixtureEase(candidate),
		valueSignal: valueSignal(candidate),
	};

	const weighted =
		metricWeights.formDelta * scores.formDelta +
		metricWeights.formTrend * scores.formTrend +
		metricWeights.expectedPointsDelta * scores.expectedPointsDelta +
		metricWeights.fixtureEase * scores.fixtureEase +
		metricWeights.valueSignal * scores.valueSignal;

	return { score: weighted, scores };
}

