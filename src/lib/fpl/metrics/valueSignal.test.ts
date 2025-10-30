import { describe, it, expect } from "vitest";
import { valueSignal } from "./valueSignal";

describe("valueSignal", () => {
	it("rewards higher expected points per million", () => {
		const cheap = valueSignal({ price: 5.0, expectedPoints: 6.0 } as any);
		const expensive = valueSignal({ price: 10.0, expectedPoints: 6.0 } as any);
		expect(cheap).toBeGreaterThan(expensive);
	});
});
