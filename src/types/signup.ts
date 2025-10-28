export interface UserTeamData {
  id: string;
  userId: string;
  fplTeamId: string;
  fplLeagueId: string;
  favoriteTeam: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  fplTeamId: string;
  fplLeagueId: string;
  favoriteTeam: string;
}

export interface SignUpResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  errors?: {
    fplTeamId?: string;
    fplLeagueId?: string;
    general?: string;
  };
}

export interface FplValidationResult {
  valid: boolean;
  error?: string;
}
