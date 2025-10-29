import type { LeagueComparison } from '@/types/fpl'
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card'
import { Award, Users, TrendingUp, BarChart3 } from 'lucide-react'

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
            <div className="flex items-center gap-2 text-gray-600">
              <Award className="h-4 w-4" />
              Current Rank:
            </div>
            <span className="font-semibold text-lg">#{league.userRank}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              Behind {league.rivalAbove.name}:
            </div>
            <span className="font-semibold text-lg text-red-600">
              {league.pointsGap > 0 ? `+${league.pointsGap}pts` : `${league.pointsGap}pts`}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="h-4 w-4" />
              Your Avg PPW:
            </div>
            <span className="font-semibold text-lg text-blue-600">
              {league.userAvgPointsPerWeek.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="h-4 w-4" />
              Their Avg PPW:
            </div>
            <span className="font-semibold text-lg text-orange-600">
              {league.rivalAbove.avgPointsPerWeek.toFixed(1)}
            </span>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
