import type { FplRosterPlayer } from '@/types/fpl'
import { Card, CardPanel } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Shield, DollarSign, TrendingUp, Target } from 'lucide-react'

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
                <Badge variant="warning" size="sm" className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  C
                </Badge>
              )}
              {player.isViceCaptain && (
                <Badge variant="secondary" size="sm" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  V
                </Badge>
              )}
            </div>
          )}
          
          {/* Stats */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-600">
                <DollarSign className="h-3 w-3" />
                Price:
              </div>
              <span className="font-semibold">£{player.price.toFixed(1)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-600">
                <TrendingUp className="h-3 w-3" />
                Form:
              </div>
              <span className="font-semibold">{player.form.toFixed(1)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-gray-600">
                <Target className="h-3 w-3" />
                PPG:
              </div>
              <span className="font-semibold">{player.pointsPerGame.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
