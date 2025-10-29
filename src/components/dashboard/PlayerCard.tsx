import type { FplRosterPlayer } from '@/types/fpl'
import { Card, CardPanel } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PlayerCardProps {
  player: FplRosterPlayer
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Card className="min-w-[140px] max-w-[160px]">
      <CardPanel className="p-3">
        <div className="text-center">
          {/* Team abbreviation */}
          <div className="text-xs font-bold text-gray-600 mb-1">
            {player.team}
          </div>
          
          {/* Player name */}
          <div className="font-semibold text-sm text-gray-900 mb-2 truncate">
            {player.name}
          </div>
          
          {/* Captain/Vice Captain badges */}
          {(player.isCaptain || player.isViceCaptain) && (
            <div className="mb-2 flex justify-center gap-1">
              {player.isCaptain && (
                <Badge variant="warning" size="sm">C</Badge>
              )}
              {player.isViceCaptain && (
                <Badge variant="secondary" size="sm">V</Badge>
              )}
            </div>
          )}
          
          {/* Stats */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-semibold">£{player.price.toFixed(1)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Form:</span>
              <span className="font-semibold">{player.form.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PPG:</span>
              <span className="font-semibold">{player.pointsPerGame.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
