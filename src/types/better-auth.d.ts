declare module "better-auth" {
	// biome-ignore lint/suspicious/noExplicitAny: better-auth types are complex and not fully typed in this module augmentation
	export function betterAuth(options: any): any;

	interface Session {
		user: {
			id: string;
			email: string;
			name: string;
			emailVerified: boolean;
			image?: string | null;
			createdAt: Date;
			updatedAt: Date;
			fplTeamId: string | null;
			fplLeagueId: string | null;
			favoriteTeam: string | null;
		};
	}
}
