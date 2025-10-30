import { describe, it, expect } from "vitest";
import { selectSwapOut, buildCandidatePool } from "./adapters";
import type { FplRosterPlayer } from "@/types/fpl";

const p = (
	id: number,
	ep: number,
	form: number,
	position: "GKP" | "DEF" | "MID" | "FWD" = "MID",
): FplRosterPlayer => ({
	id,
	name: String(id),
	team: "1",
	position,
	price: 6,
	totalPoints: 0,
	form,
	pointsPerGame: 0,
	expectedPoints: ep,
	isCaptain: false,
	isViceCaptain: false,
	multiplier: 1,
});

describe("adapters", () => {
	it("selectSwapOut picks lowest expectedPoints (ties by lower form)", () => {
		const roster = [p(1, 3, 5), p(2, 3, 4), p(3, 8, 6)];
		const out = selectSwapOut(roster);
		expect(out.id).toBe(2);
	});

	it("buildCandidatePool excludes owned players", () => {
		const roster = [p(1, 5, 5)];
		const all = [p(1, 5, 5), p(2, 6, 6), p(3, 7, 7)];
		const pool = buildCandidatePool(roster, all);
		expect(pool.map((c) => c.id)).toEqual([2, 3]);
	});

	it("buildCandidatePool filters by position when specified", () => {
		const roster = [p(1, 5, 5, "DEF")];
		const all = [
			p(1, 5, 5, "DEF"),
			p(2, 6, 6, "MID"),
			p(3, 7, 7, "DEF"),
			p(4, 8, 8, "FWD"),
		];
		const pool = buildCandidatePool(roster, all, "DEF");
		expect(pool.map((c) => c.id)).toEqual([3]);
	});
});
