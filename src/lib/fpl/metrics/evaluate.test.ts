import { describe, expect, it } from "vitest";
import type { FplRosterPlayer } from "@/types/fpl";
import { evaluateCandidate } from "./evaluate";

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
