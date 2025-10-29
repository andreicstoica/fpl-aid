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