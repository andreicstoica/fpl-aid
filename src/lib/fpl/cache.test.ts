import { describe, it, expect } from "vitest";
import { computeContextHash } from "./cache";

describe("cache.computeContextHash", () => {
  it("is deterministic and sensitive to changes", () => {
    const a1 = computeContextHash({ a: 1, b: 2 });
    const a2 = computeContextHash({ a: 1, b: 2 });
    const b = computeContextHash({ a: 1, b: 3 });
    expect(a1).toBe(a2);
    expect(b).not.toBe(a1);
  });
});

