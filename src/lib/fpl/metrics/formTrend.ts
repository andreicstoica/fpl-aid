import { normalize } from "@/lib/fpl/trends";
import type { FplRosterPlayer } from "@/types/fpl";

// Placeholder: without historical samples, reuse form level
export function formTrend(candidate: Pick<FplRosterPlayer, "form">) {
	return normalize(candidate.form, 0, 10);
}
