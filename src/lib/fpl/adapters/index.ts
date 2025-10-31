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
	targetPosition?: "GKP" | "DEF" | "MID" | "FWD",
): Candidate[] {
	// Evaluate all non-owned players as potential INs
	const ownedIds = new Set(roster.map((p) => p.id));
	let candidates = allPlayers.filter((p) => !ownedIds.has(p.id));

	// Filter by position if specified
	if (targetPosition) {
		candidates = candidates.filter((p) => p.position === targetPosition);
	}

	return candidates.map((p) => ({ ...p }));
}

export function selectSwapOut(roster: FplRosterPlayer[]): FplRosterPlayer {
	// Choose the lowest season-long output, tie-break on near-term projection then form
	return roster.reduce((worst, p) => {
		if (!worst) return p;
		if (p.pointsPerGame !== worst.pointsPerGame) {
			return p.pointsPerGame < worst.pointsPerGame ? p : worst;
		}
		if (p.expectedPoints !== worst.expectedPoints) {
			return p.expectedPoints < worst.expectedPoints ? p : worst;
		}
		return p.form < worst.form ? p : worst;
	});
}
