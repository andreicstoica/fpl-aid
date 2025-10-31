import { describe, expect, it } from "vitest";
import type { FplBootstrapPlayer, FplRosterPlayer } from "@/types/fpl";
import { assessPlayerRisk, getBadgeEmoji, type RiskBadge } from ".";

function buildBootstrapPlayer(
  overrides: Partial<FplBootstrapPlayer> = {},
): FplBootstrapPlayer {
  return {
    id: 1,
    first_name: "Test",
    second_name: "Player",
    web_name: "TestPlayer",
    element_type: 3,
    team: 1,
    now_cost: 80,
    total_points: 100,
    form: "6.0",
    points_per_game: "6.0",
    expected_points: "6.0",
    news: "",
    status: "",
    ...overrides,
  };
}

function buildRosterPlayer(
  overrides: Partial<FplRosterPlayer> = {},
): FplRosterPlayer {
  return {
    id: 1,
    name: "TestPlayer",
    team: "LIV",
    position: "MID",
    price: 8.0,
    totalPoints: 100,
    form: 6.0,
    pointsPerGame: 6.0,
    expectedPoints: 6.0,
    isCaptain: false,
    isViceCaptain: false,
    multiplier: 1,
    ...overrides,
  };
}

describe("assessPlayerRisk", () => {
  it("returns ok for healthy player", () => {
    const player = buildBootstrapPlayer();
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("ok");
  });

  it("detects suspended status", () => {
    const player = buildBootstrapPlayer({ status: "s" });
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("suspended");
  });

  it("detects injured status", () => {
    const player = buildBootstrapPlayer({ status: "i" });
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("injured");
  });

  it("detects doubtful from chance of playing", () => {
    const player = buildBootstrapPlayer({ chance_of_playing_next_round: 50 });
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("doubtful");
  });

  it("detects form dip", () => {
    const player = buildBootstrapPlayer();
    const roster = buildRosterPlayer({ form: 4.0, pointsPerGame: 6.0 });
    const risk = assessPlayerRisk(player, roster);
    expect(risk.badge).toBe("form_dip");
  });

  it("prioritizes suspended over other conditions", () => {
    const player = buildBootstrapPlayer({
      status: "s",
      chance_of_playing_next_round: 50,
    });
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("suspended");
  });

  it("prioritizes injured over form_dip", () => {
    const player = buildBootstrapPlayer({ status: "i" });
    const roster = buildRosterPlayer({ form: 2.0, pointsPerGame: 6.0 });
    const risk = assessPlayerRisk(player, roster);
    expect(risk.badge).toBe("injured");
  });

  it("reads news text for suspended keyword", () => {
    const player = buildBootstrapPlayer({
      news: "Player suspended for 3 matches",
    });
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("suspended");
  });

  it("reads news text for injury keyword", () => {
    const player = buildBootstrapPlayer({
      news: "Knee injury, 75% chance of playing",
    });
    const risk = assessPlayerRisk(player);
    expect(risk.badge).toBe("injured");
  });
});

describe("getBadgeEmoji", () => {
  const testCases: Array<{ badge: RiskBadge; expected: string }> = [
    { badge: "injured", expected: "🤕" },
    { badge: "suspended", expected: "❌" },
    { badge: "doubtful", expected: "⚠️" },
    { badge: "form_dip", expected: "📉" },
    { badge: "ok", expected: "✅" },
  ];

  testCases.forEach(({ badge, expected }) => {
    it(`returns correct emoji for ${badge}`, () => {
      expect(getBadgeEmoji(badge)).toBe(expected);
    });
  });
});
