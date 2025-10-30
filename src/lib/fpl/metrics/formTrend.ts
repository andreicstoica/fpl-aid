import type { FplRosterPlayer } from "@/types/fpl";
import { normalize } from "@/lib/fpl/trends";

// Placeholder: without historical samples, reuse form level
export function formTrend(candidate: Pick<FplRosterPlayer, "form">) {
	return normalize(candidate.form, 0, 10);
}
