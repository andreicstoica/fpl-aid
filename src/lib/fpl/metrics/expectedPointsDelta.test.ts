import { describe, it, expect } from "vitest";
import { expectedPointsDelta } from "./expectedPointsDelta";

describe("expectedPointsDelta", () => {
  it("increases when expectedPoints exceeds pointsPerGame", () => {
    const a = expectedPointsDelta({ expectedPoints: 3, pointsPerGame: 5 } as any);
    const b = expectedPointsDelta({ expectedPoints: 7, pointsPerGame: 5 } as any);
    expect(b).toBeGreaterThan(a);
  });
});

