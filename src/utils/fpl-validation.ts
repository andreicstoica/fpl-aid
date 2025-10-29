export interface FplValidationResult {
  valid: boolean;
  error?: string;
}

const FPL_API_BASE = 'https://fantasy.premierleague.com/api';

/**
 * Validates an FPL team ID by checking if it exists in the FPL API
 */
export async function validateFplTeamId(teamId: string): Promise<FplValidationResult> {
  try {
    // Convert to number to validate format
    const numericTeamId = parseInt(teamId, 10);
    if (isNaN(numericTeamId) || numericTeamId <= 0) {
      return {
        valid: false,
        error: 'Team ID must be a positive number'
      };
    }

    // Fetch team data from FPL API
    const response = await fetch(`${FPL_API_BASE}/entry/${numericTeamId}/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          error: 'Team ID not found. Please check your FPL team ID.'
        };
      }
      
      if (response.status === 429) {
        return {
          valid: false,
          error: 'FPL API rate limit exceeded. Please try again in a moment.'
        };
      }
      
      return {
        valid: false,
        error: 'Unable to verify team ID. Please try again later.'
      };
    }

    const teamData = await response.json();
    
    // Basic validation that we got valid team data
    if (!teamData.id || teamData.id !== numericTeamId) {
      return {
        valid: false,
        error: 'Invalid team data received from FPL API.'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('FPL team validation error:', error);
    return {
      valid: false,
      error: 'Network error while validating team ID. Please check your connection and try again.'
    };
  }
}

/**
 * Validates an FPL league ID by checking if it exists in the FPL API
 */
export async function validateFplLeagueId(leagueId: string): Promise<FplValidationResult> {
  try {
    // Convert to number to validate format
    const numericLeagueId = parseInt(leagueId, 10);
    if (isNaN(numericLeagueId) || numericLeagueId <= 0) {
      return {
        valid: false,
        error: 'League ID must be a positive number'
      };
    }

    // Fetch league data from FPL API
    const response = await fetch(`${FPL_API_BASE}/leagues-classic/${numericLeagueId}/standings/`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          error: 'League ID not found. Please check your FPL league ID.'
        };
      }
      
      if (response.status === 429) {
        return {
          valid: false,
          error: 'FPL API rate limit exceeded. Please try again in a moment.'
        };
      }
      
      return {
        valid: false,
        error: 'Unable to verify league ID. Please try again later.'
      };
    }

    const leagueData = await response.json();
    
    // Basic validation that we got valid league data
    if (!leagueData.league || leagueData.league.id !== numericLeagueId) {
      return {
        valid: false,
        error: 'Invalid league data received from FPL API.'
      };
    }

    return { valid: true };
  } catch (error) {
    console.error('FPL league validation error:', error);
    return {
      valid: false,
      error: 'Network error while validating league ID. Please check your connection and try again.'
    };
  }
}

/**
 * Validates both FPL team and league IDs
 */
export async function validateFplData(teamId: string, leagueId: string): Promise<{
  teamResult: FplValidationResult;
  leagueResult: FplValidationResult;
  allValid: boolean;
}> {
  const [teamResult, leagueResult] = await Promise.all([
    validateFplTeamId(teamId),
    validateFplLeagueId(leagueId)
  ]);

  return {
    teamResult,
    leagueResult,
    allValid: teamResult.valid && leagueResult.valid
  };
}
