import type { FplManagerStats } from '@/types/fpl'
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card'

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
            <div className="text-2xl font-bold text-blue-600">{manager.totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">GW{manager.currentGameweek}</div>
            <div className="text-sm text-gray-600">Current GW</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{manager.transfersRemaining}</div>
            <div className="text-sm text-gray-600">Transfers Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">£{manager.bankBalance.toFixed(1)}m</div>
            <div className="text-sm text-gray-600">In Bank</div>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
