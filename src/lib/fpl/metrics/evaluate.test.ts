import { describe, it, expect } from "vitest";
import { evaluateCandidate } from "./evaluate";
import type { FplRosterPlayer } from "@/types/fpl";

const makePlayer = (over: Partial<FplRosterPlayer> = {}) => ({
	id: 1,
	name: "Test",
	team: "1",
	position: "MID",
	price: 7.5,
	form: 6.0,
	pointsPerGame: 5.0,
	expectedPoints: 6.5,
	...over,
});

describe("evaluateCandidate", () => {
	it("produces higher score for better expected points", () => {
		const a = evaluateCandidate(makePlayer({ expectedPoints: 3 }));
		const b = evaluateCandidate(makePlayer({ expectedPoints: 8 }));
		expect(b.score).toBeGreaterThan(a.score);
	});
});
