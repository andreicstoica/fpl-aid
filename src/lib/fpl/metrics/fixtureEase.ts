// Without a fixture model, use expectedPoints proxy as ease signal.

import { normalize } from "@/lib/fpl/trends";
import type { FplRosterPlayer } from "@/types/fpl";

export function fixtureEase(
	candidate: Pick<FplRosterPlayer, "expectedPoints">,
) {
	return normalize(candidate.expectedPoints || 0, 0, 10);
}
