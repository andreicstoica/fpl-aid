import type { FplManagerStats } from '@/types/fpl'
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card'
import { Trophy, Calendar, RefreshCw, Coins } from 'lucide-react'

interface ManagerStatsProps {
  manager: FplManagerStats
}

export function ManagerStats({ manager }: ManagerStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Stats</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{manager.totalPoints}</span>
            </div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">GW{manager.currentGameweek}</span>
            </div>
            <div className="text-sm text-gray-600">Current GW</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{manager.transfersRemaining}</span>
            </div>
            <div className="text-sm text-gray-600">Transfers Left</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Coins className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">£{manager.bankBalance.toFixed(1)}m</span>
            </div>
            <div className="text-sm text-gray-600">In Bank</div>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
