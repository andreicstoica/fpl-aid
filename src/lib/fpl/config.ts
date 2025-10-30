export const RECOMMENDATIONS_TTL_MS = 6 * 60 * 60 * 1000; // 6h max

export const WEIGHTS_VERSION = "v1.3";

export const metricWeights = {
	formDelta: 0.25,
	formTrend: 0.2,
	expectedPointsDelta: 0.35,
	fixtureEase: 0.15,
	valueSignal: 0.05,
} as const;

export const DIFFERENTIAL_MIN_SCORE = 0.0; // allow ranking to decide

export const MAX_RECOMMENDATIONS = 3;

export function getTtlUntil(date: Date): number {
	const ms = Math.max(0, date.getTime() - Date.now());
	return Math.min(ms, RECOMMENDATIONS_TTL_MS);
}
