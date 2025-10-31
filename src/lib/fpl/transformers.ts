import type {
	FplBootstrapPlayer,
	FplRosterPlayer,
	FplTeamPick,
} from "@/types/fpl";
import { PREMIER_LEAGUE_TEAMS } from "@/types/teams";

export function getTeamName(teamId: number): string {
	const team = PREMIER_LEAGUE_TEAMS.find((t) => t.id === teamId);
	return team?.shortName || `Team ${teamId}`;
}

export function getPositionName(
	elementType: number,
): FplRosterPlayer["position"] {
	switch (elementType) {
		case 1:
			return "GKP";
		case 2:
			return "DEF";
		case 3:
			return "MID";
		case 4:
			return "FWD";
		default:
			return "MID";
	}
}

export function convertPrice(nowCost: number): number {
	return nowCost / 10;
}

export function buildPlayerMap(players: FplBootstrapPlayer[]) {
	return new Map(players.map((player) => [player.id, player]));
}

export function toRosterPlayer(
	player: FplBootstrapPlayer,
	pick: FplTeamPick,
): FplRosterPlayer {
	return {
		id: player.id,
		name: player.web_name,
		team: getTeamName(player.team),
		position: getPositionName(player.element_type),
		price: convertPrice(player.now_cost),
		totalPoints: player.total_points,
		form: parseFloat(player.form) || 0,
		pointsPerGame: parseFloat(player.points_per_game) || 0,
		expectedPoints: parseFloat(player.ep_next || player.ep_this || "0") || 0,
		isCaptain: pick.is_captain,
		isViceCaptain: pick.is_vice_captain,
		multiplier: pick.multiplier,
		status: player.status,
		news: player.news,
		chanceOfPlayingNextRound: player.chance_of_playing_next_round ?? null,
	};
}

export function buildRoster({
	picks,
	players,
}: {
	picks: FplTeamPick[];
	players: FplBootstrapPlayer[];
}): FplRosterPlayer[] {
	const playerMap = buildPlayerMap(players);
	return picks.map((pick) => {
		const player = playerMap.get(pick.element);
		if (!player) {
			throw new Error(`Player with ID ${pick.element} not found`);
		}
		return toRosterPlayer(player, pick);
	});
}

export function calculateAvgPointsPerWeek(
	totalPoints: number,
	currentGameweek: number,
): number {
	return currentGameweek > 0 ? totalPoints / currentGameweek : 0;
}
