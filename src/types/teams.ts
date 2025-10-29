export interface TeamColors {
	primary: string;
	secondary: string;
	pattern?: string;
}

export interface PremierLeagueTeam {
	id: number;
	name: string;
	shortName: string;
	aliases: string[];
	colors: TeamColors;
}

export const PREMIER_LEAGUE_TEAMS: PremierLeagueTeam[] = [
	{
		id: 1,
		name: "Arsenal",
		shortName: "ARS",
		aliases: ["Arsenal", "ARS"],
		colors: { primary: "bg-red-600", secondary: "bg-white" },
	},
	{
		id: 2,
		name: "Aston Villa",
		shortName: "AVL",
		aliases: ["Aston Villa", "AVL"],
		colors: { primary: "bg-purple-800", secondary: "bg-sky-400" },
	},
	{
		id: 3,
		name: "Burnley",
		shortName: "BUR",
		aliases: ["Burnley", "BUR"],
		colors: { primary: "bg-purple-900", secondary: "bg-sky-400" },
	},
	{
		id: 4,
		name: "Bournemouth",
		shortName: "BOU",
		aliases: ["Bournemouth", "AFC Bournemouth", "BOU"],
		colors: {
			primary: "bg-red-600",
			secondary: "bg-black",
			pattern: "stripes",
		},
	},
	{
		id: 5,
		name: "Brentford",
		shortName: "BRE",
		aliases: ["Brentford", "BRE"],
		colors: {
			primary: "bg-red-500",
			secondary: "bg-white",
			pattern: "stripes",
		},
	},
	{
		id: 6,
		name: "Brighton",
		shortName: "BHA",
		aliases: ["Brighton", "BHA"],
		colors: {
			primary: "bg-blue-500",
			secondary: "bg-white",
			pattern: "stripes",
		},
	},
	{
		id: 7,
		name: "Chelsea",
		shortName: "CHE",
		aliases: ["Chelsea", "CHE"],
		colors: { primary: "bg-blue-600", secondary: "bg-white" },
	},
	{
		id: 8,
		name: "Crystal Palace",
		shortName: "CRY",
		aliases: ["Crystal Palace", "CRY"],
		colors: {
			primary: "bg-blue-600",
			secondary: "bg-red-600",
			pattern: "half",
		},
	},
	{
		id: 9,
		name: "Everton",
		shortName: "EVE",
		aliases: ["Everton", "EVE"],
		colors: { primary: "bg-blue-700", secondary: "bg-white" },
	},
	{
		id: 10,
		name: "Fulham",
		shortName: "FUL",
		aliases: ["Fulham", "FUL"],
		colors: { primary: "bg-white", secondary: "bg-black" },
	},
	{
		id: 11,
		name: "Leeds",
		shortName: "LEE",
		aliases: ["Leeds", "Leeds United", "LEE"],
		colors: { primary: "bg-white", secondary: "bg-yellow-400" },
	},
	{
		id: 12,
		name: "Liverpool",
		shortName: "LIV",
		aliases: ["Liverpool", "LIV"],
		colors: { primary: "bg-red-700", secondary: "bg-white" },
	},
	{
		id: 13,
		name: "Man City",
		shortName: "MCI",
		aliases: ["Man City", "Manchester City", "MCI"],
		colors: { primary: "bg-sky-400", secondary: "bg-white" },
	},
	{
		id: 14,
		name: "Man Utd",
		shortName: "MUN",
		aliases: ["Man Utd", "Manchester United", "MUN"],
		colors: { primary: "bg-red-600", secondary: "bg-white" },
	},
	{
		id: 15,
		name: "Newcastle",
		shortName: "NEW",
		aliases: ["Newcastle", "NEW"],
		colors: { primary: "bg-black", secondary: "bg-white", pattern: "stripes" },
	},
	{
		id: 16,
		name: "Nott'm Forest",
		shortName: "NFO",
		aliases: ["Nottingham Forest", "Nottm Forest", "NFO"],
		colors: { primary: "bg-red-700", secondary: "bg-white" },
	},
	{
		id: 17,
		name: "Sunderland",
		shortName: "SUN",
		aliases: ["Sunderland", "SUN"],
		colors: {
			primary: "bg-red-600",
			secondary: "bg-white",
			pattern: "stripes",
		},
	},
	{
		id: 18,
		name: "Spurs",
		shortName: "TOT",
		aliases: ["Tottenham", "Spurs", "TOT"],
		colors: {
			primary: "bg-white",
			secondary: "bg-blue-900",
			pattern: "navy-trim",
		},
	},
	{
		id: 19,
		name: "West Ham",
		shortName: "WHU",
		aliases: ["West Ham", "WHU"],
		colors: { primary: "bg-rose-900", secondary: "bg-sky-500" },
	},
	{
		id: 20,
		name: "Wolves",
		shortName: "WOL",
		aliases: ["Wolves", "Wolverhampton", "WOL"],
		colors: { primary: "bg-orange-500", secondary: "bg-black" },
	},
];

// Helper functions
export const getTeamById = (id: number): PremierLeagueTeam | undefined => {
	return PREMIER_LEAGUE_TEAMS.find((team) => team.id === id);
};

export const getTeamByName = (name: string): PremierLeagueTeam | undefined => {
	const normalizedName = name.trim();
	return PREMIER_LEAGUE_TEAMS.find((team) =>
		team.aliases.some(
			(alias) => alias.toLowerCase() === normalizedName.toLowerCase(),
		),
	);
};

export const getTeamColors = (team: string): TeamColors => {
	const foundTeam = getTeamByName(team);
	if (!foundTeam) {
		return { primary: "bg-gray-500", secondary: "bg-white" };
	}
	return foundTeam.colors;
};
