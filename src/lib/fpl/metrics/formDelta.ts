import type { FplRosterPlayer } from "@/types/fpl";
import { normalize } from "@/lib/fpl/trends";

export function formDelta(
	candidate: Pick<FplRosterPlayer, "form" | "pointsPerGame">,
) {
	const delta = candidate.form - (candidate.pointsPerGame || 0);
	// delta in [-10..10] normalized
	return normalize(delta + 10, 0, 20);
}
