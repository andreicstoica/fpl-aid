import { describe, expect, it } from "vitest";
import { computeRecommendations } from ".";

const p = (
	id: number,
	ep: number,
	form: number,
	price = 6,
	pointsPerGame = 5,
) => ({
	id,
	name: `P${id}`,
	team: "1",
	position: "MID",
	price,
	totalPoints: 0,
	form,
	pointsPerGame,
	expectedPoints: ep,
	isCaptain: false,
	isViceCaptain: false,
	multiplier: 1,
});

describe("computeRecommendations", () => {
	it("returns up to 3 ranked items", () => {
		const roster = [p(1, 4, 4, 6, 3.5)];
		const all = [
			p(1, 4, 4, 6, 3.5),
			p(2, 9, 8, 6.5, 5.5),
			p(3, 8, 8, 6.2, 5.2),
			p(4, 7, 6, 6, 4.9),
			p(5, 6, 6, 5.5, 4.8),
		];
		const res = computeRecommendations(roster, all);
		expect(res.items.length).toBeGreaterThan(0);
		expect(res.items.length).toBeLessThanOrEqual(3);
		// Best expected points should be first
		expect(res.items[0].in.id).toBe(2);
		expect(res.items[0].weeklyPointsDelta).toBeGreaterThan(0);
		expect(res.items[0].valuePerMillion).toBeGreaterThan(0);
		expect(res.items[0].nextFixtureExpectedDelta).toBeGreaterThan(0);
	});
});
