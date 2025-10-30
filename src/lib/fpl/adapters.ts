import type { FplRosterPlayer } from "@/types/fpl";

export type Candidate = Pick<
	FplRosterPlayer,
	| "id"
	| "name"
	| "team"
	| "position"
	| "price"
	| "form"
	| "pointsPerGame"
	| "expectedPoints"
> & {
	rivalOwnershipPct?: number;
};

export function buildCandidatePool(
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
): Candidate[] {
	// For v1.1 keep it simple: evaluate all non-owned players as potential INs
	const ownedIds = new Set(roster.map((p) => p.id));
	return allPlayers.filter((p) => !ownedIds.has(p.id)).map((p) => ({ ...p }));
}

export function selectSwapOut(roster: FplRosterPlayer[]): FplRosterPlayer {
	// naive: choose lowest expectedPoints, tie-break lower form
	return roster.reduce((worst, p) => {
		if (!worst) return p;
		if (p.expectedPoints !== worst.expectedPoints) {
			return p.expectedPoints < worst.expectedPoints ? p : worst;
		}
		return p.form < worst.form ? p : worst;
	});
}
