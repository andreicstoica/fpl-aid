import { normalize } from "@/lib/fpl/trends";
import type { FplRosterPlayer } from "@/types/fpl";

export function valueSignal(
	candidate: Pick<FplRosterPlayer, "price" | "expectedPoints">,
) {
	const perMillion =
		(candidate.expectedPoints || 0) / Math.max(0.1, candidate.price);
	return normalize(perMillion, 0, 2);
}
