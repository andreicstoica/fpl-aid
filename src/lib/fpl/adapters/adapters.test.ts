import { describe, expect, it } from "vitest";
import type { FplRosterPlayer } from "@/types/fpl";
import { buildCandidatePool, selectSwapOut } from ".";

const p = (
  id: number,
  ep: number,
  form: number,
  pointsPerGame = 0,
  position: "GKP" | "DEF" | "MID" | "FWD" = "MID",
): FplRosterPlayer => ({
  id,
  name: String(id),
  team: "1",
  position,
  price: 6,
  totalPoints: 0,
  form,
  pointsPerGame,
  expectedPoints: ep,
  isCaptain: false,
  isViceCaptain: false,
  multiplier: 1,
});

describe("adapters", () => {
  it("selectSwapOut favors lowest pointsPerGame then expectedPoints", () => {
    const roster = [p(1, 5, 6, 4), p(2, 3, 5, 3), p(3, 2, 7, 3), p(4, 8, 4, 5)];
    const out = selectSwapOut(roster);
    expect(out.id).toBe(3);
  });

  it("buildCandidatePool excludes owned players", () => {
    const roster = [p(1, 5, 5)];
    const all = [p(1, 5, 5), p(2, 6, 6), p(3, 7, 7)];
    const pool = buildCandidatePool(roster, all);
    expect(pool.map((c) => c.id)).toEqual([2, 3]);
  });

  it("buildCandidatePool filters by position when specified", () => {
    const roster = [p(1, 5, 5, 4, "DEF")];
    const all = [
      p(1, 5, 5, 4, "DEF"),
      p(2, 6, 6, 5, "MID"),
      p(3, 7, 7, 4.5, "DEF"),
      p(4, 8, 8, 6, "FWD"),
    ];
    const pool = buildCandidatePool(roster, all, "DEF");
    expect(pool.map((c) => c.id)).toEqual([3]);
  });
});
