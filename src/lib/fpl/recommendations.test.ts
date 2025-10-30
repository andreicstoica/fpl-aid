import { describe, it, expect } from "vitest";
import { computeRecommendations } from "./recommendations";

const p = (id: number, ep: number, form: number, price = 6) => ({
  id,
  name: `P${id}`,
  team: "1",
  position: "MID",
  price,
  totalPoints: 0,
  form,
  pointsPerGame: 5,
  expectedPoints: ep,
  isCaptain: false,
  isViceCaptain: false,
  multiplier: 1,
});

describe("computeRecommendations", () => {
  it("returns up to 3 ranked items", () => {
    const roster = [p(1, 4, 4)] as any;
    const all = [p(1, 4, 4), p(2, 9, 8), p(3, 8, 8), p(4, 7, 6), p(5, 6, 6)] as any;
    const res = computeRecommendations(roster, all);
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items.length).toBeLessThanOrEqual(3);
    // Best expected points should be first
    expect(res.items[0].in.id).toBe(2);
  });
});

