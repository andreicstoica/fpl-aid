import { describe, it, expect } from "vitest";
import { formDelta } from "./formDelta";

describe("formDelta", () => {
  it("normalizes positive delta higher than negative", () => {
    const low = formDelta({ form: 3, pointsPerGame: 6 } as any);
    const high = formDelta({ form: 8, pointsPerGame: 5 } as any);
    expect(high).toBeGreaterThan(low);
  });
});

