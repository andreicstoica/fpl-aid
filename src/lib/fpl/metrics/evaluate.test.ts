import { describe, it, expect } from "vitest";
import { evaluateCandidate } from "./evaluate";

const makePlayer = (over: Partial<any> = {}) => ({
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
		const a = evaluateCandidate(makePlayer({ expectedPoints: 3 } as any));
		const b = evaluateCandidate(makePlayer({ expectedPoints: 8 } as any));
		expect(b.score).toBeGreaterThan(a.score);
	});
});

