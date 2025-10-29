import type { LeagueComparison } from '@/types/fpl'
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card'

interface LeagueStatsProps {
  league: LeagueComparison
}

export function LeagueStats({ league }: LeagueStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>League Position</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Current Rank:</span>
            <span className="font-semibold text-lg">#{league.userRank}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Behind {league.rivalAbove.name}:</span>
            <span className="font-semibold text-lg text-red-600">
              {league.pointsGap > 0 ? `+${league.pointsGap}pts` : `${league.pointsGap}pts`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Your Avg PPW:</span>
            <span className="font-semibold text-lg text-blue-600">
              {league.userAvgPointsPerWeek.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Their Avg PPW:</span>
            <span className="font-semibold text-lg text-orange-600">
              {league.rivalAbove.avgPointsPerWeek.toFixed(1)}
            </span>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
