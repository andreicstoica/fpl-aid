import type { FplBootstrapPlayer, FplRosterPlayer } from "@/types/fpl";
import { formDelta } from "./metrics/formDelta";

export type RiskBadge =
	| "injured"
	| "suspended"
	| "doubtful"
	| "form_dip"
	| "ok";

export interface PlayerRiskInfo {
	id: number;
	name: string;
	team: string;
	badge: RiskBadge;
	news: string;
}

const FORM_DIP_THRESHOLD = -1.5; // Points form is below PPG

/**
 * Determines player risk badge based on FPL status and recent form.
 * Priority: suspended > injured > doubtful > form_dip > ok
 */
export function assessPlayerRisk(
	player: FplBootstrapPlayer,
	rosterPlayer?: FplRosterPlayer,
): PlayerRiskInfo {
	const badge = evaluateRiskBadge(player, rosterPlayer);
	const news = player.news || "";

	return {
		id: player.id,
		name: player.web_name,
		team: player.team.toString(),
		badge,
		news,
	};
}

function evaluateRiskBadge(
	player: FplBootstrapPlayer,
	rosterPlayer?: FplRosterPlayer,
): RiskBadge {
	// Check status flag first
	const status = player.status?.toLowerCase();
	if (status === "s" || status === "sus") return "suspended";
	if (status === "i" || status === "inj") return "injured";

	// Check chance of playing
	if (
		player.chance_of_playing_next_round !== null &&
		player.chance_of_playing_next_round !== undefined
	) {
		const chance = player.chance_of_playing_next_round;
		if (chance > 0 && chance < 75) return "doubtful";
	}

	// Check news text for keywords
	const newsLower = (player.news || "").toLowerCase();
	if (newsLower.includes("suspended") || newsLower.includes("ban")) {
		return "suspended";
	}
	if (
		newsLower.includes("injury") ||
		newsLower.includes("hamstring") ||
		newsLower.includes("knee")
	) {
		return "injured";
	}

	// Check form dip using roster player data if available
	if (rosterPlayer) {
		const formDiff = rosterPlayer.form - rosterPlayer.pointsPerGame;
		if (formDiff < FORM_DIP_THRESHOLD) return "form_dip";
	}

	return "ok";
}

/**
 * Maps badge to emoji for email rendering
 */
export function getBadgeEmoji(badge: RiskBadge): string {
	switch (badge) {
		case "injured":
			return "🤕";
		case "suspended":
			return "❌";
		case "doubtful":
			return "⚠️";
		case "form_dip":
			return "📉";
		case "ok":
			return "✅";
		default:
			return "❓";
	}
}
