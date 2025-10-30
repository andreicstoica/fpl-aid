import type { FplRosterPlayer } from "@/types/fpl";

export type PerformanceLevel =
  | "excellent"
  | "good"
  | "average"
  | "poor"
  | "very-poor";

export function getPlayerPerformance(player: Pick<FplRosterPlayer, "form" | "expectedPoints">): PerformanceLevel {
  // Use the provided performance score approach
  const { form, expectedPoints } = player;
  const performanceScore = form * 0.6 + expectedPoints * 0.4;

  if (performanceScore >= 8) return "excellent";
  if (performanceScore >= 6.5) return "good";
  if (performanceScore >= 4.5) return "average";
  if (performanceScore >= 3) return "poor";
  return "very-poor";
}

export function getPerformanceColors(performance: PerformanceLevel) {
  switch (performance) {
    case "excellent":
      return "bg-green-100/95 border-green-300 shadow-green-200/50";
    case "good":
      return "bg-green-50/95 border-green-200 shadow-green-100/50";
    case "average":
      return "bg-white/90 border-gray-200 shadow-gray-100/50";
    case "poor":
      return "bg-red-50/95 border-red-200 shadow-red-100/50";
    case "very-poor":
      return "bg-red-100/95 border-red-300 shadow-red-200/50";
    default:
      return "bg-white/90 border-gray-200 shadow-gray-100/50";
  }
}

export function isFormDropping(player: Pick<FplRosterPlayer, "form" | "expectedPoints">): boolean {
  const perf = getPlayerPerformance(player);
  return perf === "poor" || perf === "very-poor";
}

export function isFormPlummeting(
  player: Pick<FplRosterPlayer, "form" | "pointsPerGame">
): boolean {
  const { form, pointsPerGame } = player;
  if (pointsPerGame <= 0) return false;
  return form <= 0.67 * pointsPerGame;
}
