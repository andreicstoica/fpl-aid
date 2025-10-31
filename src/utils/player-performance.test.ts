import { describe, expect, it } from "vitest";
import { getPlayerPerformance, isFormDropping } from "./player-performance";

describe("player-performance", () => {
	it("classifies performance levels", () => {
		expect(getPlayerPerformance({ form: 9, expectedPoints: 9 })).toBe(
			"excellent",
		);
		expect(getPlayerPerformance({ form: 6.6, expectedPoints: 6.6 })).toBe(
			"good",
		);
		expect(getPlayerPerformance({ form: 4.6, expectedPoints: 4.6 })).toBe(
			"average",
		);
		expect(getPlayerPerformance({ form: 3.2, expectedPoints: 3.2 })).toBe(
			"poor",
		);
		expect(getPlayerPerformance({ form: 2.0, expectedPoints: 2.0 })).toBe(
			"very-poor",
		);
	});

	it("flags form dropping for poor and very-poor", () => {
		expect(isFormDropping({ form: 2, expectedPoints: 2 })).toBe(true);
		expect(isFormDropping({ form: 8, expectedPoints: 8 })).toBe(false);
	});
});
