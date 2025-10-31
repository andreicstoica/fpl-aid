import { describe, expect, it } from "vitest";
import { formDelta } from "./formDelta";

describe("formDelta", () => {
	it("normalizes positive delta higher than negative", () => {
		const low = formDelta({ form: 3, pointsPerGame: 6 });
		const high = formDelta({ form: 8, pointsPerGame: 5 });
		expect(high).toBeGreaterThan(low);
	});
});
