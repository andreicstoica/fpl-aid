declare module "better-auth" {
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

