export interface PlayerAlert {
	type: "injury" | "price_drop" | "form_decline";
	severity: "low" | "medium" | "high";
	message: string;
}

export interface Player {
	id: number;
	name: string;
	team: string;
	position: "GKP" | "DEF" | "MID" | "FWD";
	price: number;
	totalPoints: number;
	last3MatchesAverage?: number;
	form: number;
	pointsPerGame: number;
	expectedPoints: number;
	fixturesDifficulty: number;
	homeMatches?: number; // Number of home matches in next 5 gameweeks
	alerts?: PlayerAlert[];
}

export interface Team {
	id?: number;
	name: string;
	owner: string;
	squad?: Player[];
	totalPoints: number;
	rank?: number;
}

export interface League {
	id: number;
	name: string;
	topTeams: Team[];
	averageSquad?: Player[];
	userPosition: number;
	totalTeams?: number;
}

export interface FplManagerData {
	bankBalance: number;
	transfersRemaining: number;
	totalSquadValue: number;
	totalPoints: number;
}

export interface OpponentTeam {
	managerId: number;
	name: string;
	owner: string;
	totalPoints: number;
	pointsGap: number; // relative to user
	squad: Player[];
	squadStrength?: number; // average expected points
}

export interface DifferentialPick {
	player: Player;
	ownedByOpponents: number; // count of how many opponents own this player
	expectedPointsAdvantage: number;
	reasoning: string[];
	// Enhanced fields for swap recommendations
	playerToSwapOut: Player; // recommended player to remove
	budgetImpact: number; // net cost (IN price - OUT sell value)
	rivalsWhoOwn: string[]; // rival names who own IN player
	rivalsWhoDoNotOwn: string[]; // rival names who don't own IN player
	requiresHit: boolean; // whether swap needs a hit (FT exhausted)
	hitCost: number; // point cost if requiring a hit (typically -4)
	captaincyUplift: number; // potential extra points if captained
	gwWindow: string; // gameweek context (e.g., "GW15-GW19")
	chipCompatible: boolean; // if player suits active chip strategy
}

export interface LeagueDifferentialsData {
	opponents: OpponentTeam[];
	differentials: DifferentialPick[];
	userTotalPoints: number;
}

// FPL API Response Types
export interface FplBootstrapPlayer {
	id: number;
	first_name: string;
	second_name: string;
	web_name: string;
	element_type: number; // 1=GKP, 2=DEF, 3=MID, 4=FWD
	team: number;
	now_cost: number; // price in 0.1 units (e.g., 100 = £10.0m)
	total_points: number;
	form: string;
	points_per_game: string;
	expected_points: string;
	news: string;
	news_added?: string;
	status: string;
	chance_of_playing_next_round?: number | null;
}

export interface FplTeamPick {
	element: number; // player ID
	position: number; // 1-15 (starting 11 + 4 subs)
	is_captain: boolean;
	is_vice_captain: boolean;
	multiplier: number;
}

export interface FplRosterPlayer {
	id: number;
	name: string;
	team: string;
	position: "GKP" | "DEF" | "MID" | "FWD";
	price: number;
	totalPoints: number;
	form: number;
	pointsPerGame: number;
	expectedPoints: number;
	isCaptain: boolean;
	isViceCaptain: boolean;
	multiplier: number;
	status?: string; // FPL element status, e.g., 'i', 'd', 's', 'u', ...
	news?: string; // FPL element news string for injury/suspension context
	chanceOfPlayingNextRound?: number | null;
}

// Dashboard Types
export interface FplManagerStats {
	totalPoints: number;
	currentGameweek: number;
	transfersRemaining: number;
	bankBalance: number;
	squadValue: number;
}

export interface LeagueComparison {
	userRank: number;
	rivalAbove: {
		name: string;
		points: number;
		avgPointsPerWeek: number;
	};
	pointsGap: number;
	ppwGap: number; // Points per week gap (positive = behind, negative = ahead)
	userAvgPointsPerWeek: number;
}

export interface FplDashboardData {
	roster: FplRosterPlayer[];
	manager: FplManagerStats;
	league: LeagueComparison;
	recommendations?: Array<{
		in: FplRosterPlayer;
		out: FplRosterPlayer;
		score: number;
		rationale: string;
	}>;
}
