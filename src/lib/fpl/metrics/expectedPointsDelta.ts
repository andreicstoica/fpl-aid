import { normalize } from "@/lib/fpl/trends";
import type { FplRosterPlayer } from "@/types/fpl";

export function expectedPointsDelta(
	candidate: Pick<FplRosterPlayer, "expectedPoints" | "pointsPerGame">,
) {
	const delta =
		(candidate.expectedPoints || 0) - (candidate.pointsPerGame || 0);
	return normalize(delta + 10, 0, 20);
}
