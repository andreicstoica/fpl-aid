import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/utils/auth'
import type { FplBootstrapPlayer, FplTeamPick, FplRosterPlayer, FplDashboardData, FplManagerStats, LeagueComparison } from '@/types/fpl'
import { PREMIER_LEAGUE_TEAMS } from '@/types/teams'
import { getUserFplData } from '@/utils/user-fpl'
import { db } from '@/db/index'
import { userTeamData } from '@/db/schema'
import { eq } from 'drizzle-orm'

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Helper function to get team name by ID
function getTeamName(teamId: number): string {
  const team = PREMIER_LEAGUE_TEAMS.find(t => t.id === teamId)
  return team?.shortName || `Team ${teamId}`
}

// Helper function to convert position number to string
function getPositionName(elementType: number): "GKP" | "DEF" | "MID" | "FWD" {
  switch (elementType) {
    case 1: return "GKP"
    case 2: return "DEF"
    case 3: return "MID"
    case 4: return "FWD"
    default: return "MID" // fallback
  }
}

// Helper function to convert price from 0.1 units to actual price
function convertPrice(nowCost: number): number {
  return nowCost / 10
}

// Helper function to calculate average points per week
function calculateAvgPointsPerWeek(totalPoints: number, currentGameweek: number): number {
  return currentGameweek > 0 ? totalPoints / currentGameweek : 0
}

export const Route = createFileRoute('/api/fpl-dashboard')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get session from request headers
          const session = await auth.api.getSession({
            headers: request.headers
          })

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          const userFplData = await getUserFplData(session.user.id)

          if (!userFplData?.fplTeamId || !userFplData?.fplLeagueId) {
            return Response.json({
              roster: [],
              manager: null,
              league: null,
              needsSetup: true,
              message: 'No FPL team or league connected. Please update your profile.'
            })
          }

          const { fplTeamId, fplLeagueId, dashboardCache, dashboardCacheUpdatedAt } = userFplData
          const cacheTimestamp = dashboardCacheUpdatedAt
            ? new Date(dashboardCacheUpdatedAt)
            : null
          const canUseCache =
            dashboardCache !== null &&
            cacheTimestamp !== null &&
            Date.now() - cacheTimestamp.getTime() < CACHE_TTL

          if (canUseCache) {
            return Response.json(dashboardCache as FplDashboardData)
          }

          // Fetch all required data from FPL API
          const [bootstrapResponse, teamResponse, leagueResponse] = await Promise.all([
            fetch('https://fantasy.premierleague.com/api/bootstrap-static/'),
            fetch(`https://fantasy.premierleague.com/api/entry/${fplTeamId}/`),
            fetch(`https://fantasy.premierleague.com/api/leagues-classic/${fplLeagueId}/standings/`)
          ])

          if (!bootstrapResponse.ok || !teamResponse.ok || !leagueResponse.ok) {
            throw new Error('Failed to fetch from FPL API')
          }

          const bootstrapData = await bootstrapResponse.json()
          const teamData = await teamResponse.json()
          const leagueData = await leagueResponse.json()

          const currentEvent =
            teamData?.current_event ??
            bootstrapData?.events?.find((event: { is_current?: boolean }) => event?.is_current)?.id

          if (!currentEvent) {
            throw new Error('Unable to determine current gameweek')
          }

          const picksResponse = await fetch(
            `https://fantasy.premierleague.com/api/entry/${fplTeamId}/event/${currentEvent}/picks/`
          )

          if (!picksResponse.ok) {
            throw new Error('Failed to fetch team picks from FPL API')
          }

          const picksData = await picksResponse.json()

          // Get players and picks
          const players: FplBootstrapPlayer[] = bootstrapData.elements
          const picks: FplTeamPick[] = Array.isArray(picksData?.picks) ? picksData.picks : []

          if (picks.length === 0) {
            return Response.json({
              roster: [],
              manager: null,
              league: null,
              message: 'No picks returned for the current gameweek.'
            })
          }

          // Create a map of player data for quick lookup
          const playerMap = new Map<number, FplBootstrapPlayer>()
          players.forEach(player => {
            playerMap.set(player.id, player)
          })

          // Build roster
          const roster: FplRosterPlayer[] = picks.map(pick => {
            const player = playerMap.get(pick.element)
            if (!player) {
              throw new Error(`Player with ID ${pick.element} not found`)
            }

            return {
              id: player.id,
              name: player.web_name,
              team: getTeamName(player.team),
              position: getPositionName(player.element_type),
              price: convertPrice(player.now_cost),
              totalPoints: player.total_points,
              form: parseFloat(player.form) || 0,
              pointsPerGame: parseFloat(player.points_per_game) || 0,
              expectedPoints: parseFloat(player.expected_points) || 0,
              isCaptain: pick.is_captain,
              isViceCaptain: pick.is_vice_captain,
              multiplier: pick.multiplier
            }
          })

          // Extract manager stats
          const manager: FplManagerStats = {
            totalPoints: teamData.summary_overall_points || 0,
            currentGameweek: currentEvent,
            transfersRemaining: teamData.transfers?.limit || 0,
            bankBalance: (teamData.last_deadline_bank || 0) / 10, // Convert from 0.1 units
            squadValue: (teamData.last_deadline_value || 0) / 10 // Convert from 0.1 units
          }

          // Calculate league comparison
          const standings = leagueData?.standings?.results || []
          const userStanding = standings.find((s: any) => s.entry === parseInt(fplTeamId))
          
          let league: LeagueComparison | null = null
          if (userStanding) {
            const userRank = userStanding.rank
            const userPoints = userStanding.total
            const userAvgPPW = calculateAvgPointsPerWeek(userPoints, currentEvent)
            
            // Find the manager directly above (lower rank number = better position)
            const rivalAbove = standings.find((s: any) => s.rank === userRank - 1)
            
            if (rivalAbove) {
              const rivalPoints = rivalAbove.total
              const rivalAvgPPW = calculateAvgPointsPerWeek(rivalPoints, currentEvent)
              const ppwGap = userAvgPPW - rivalAvgPPW
              
              league = {
                userRank,
                rivalAbove: {
                  name: rivalAbove.player_name,
                  points: rivalPoints,
                  avgPointsPerWeek: rivalAvgPPW
                },
                pointsGap: rivalPoints - userPoints,
                ppwGap,
                userAvgPointsPerWeek: userAvgPPW
              }
            } else {
              // User is first place
              league = {
                userRank,
                rivalAbove: {
                  name: "League Leader",
                  points: userPoints,
                  avgPointsPerWeek: userAvgPPW
                },
                pointsGap: 0,
                ppwGap: 0,
                userAvgPointsPerWeek: userAvgPPW
              }
            }
          }

          const dashboardData: FplDashboardData = {
            roster,
            manager,
            league: league || {
              userRank: 0,
              rivalAbove: {
                name: "Unknown",
                points: 0,
                avgPointsPerWeek: 0
              },
              pointsGap: 0,
              ppwGap: 0,
              userAvgPointsPerWeek: 0
            }
          }

          // Cache the dashboard data
          await db
            .update(userTeamData)
            .set({
              dashboardCache: dashboardData,
              dashboardCacheUpdatedAt: new Date()
            })
            .where(eq(userTeamData.userId, session.user.id))

          return Response.json(dashboardData)

        } catch (error) {
          console.error('FPL dashboard API error:', error)
          return Response.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
          )
        }
      }
    }
  }
})
