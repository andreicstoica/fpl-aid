import type { FplRosterPlayer } from '@/types/fpl'
import { PlayerCard } from './PlayerCard'
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface SoccerFieldProps {
  roster: FplRosterPlayer[]
}

export function SoccerField({ roster }: SoccerFieldProps) {
  // Group players by position
  const playersByPosition = roster.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = []
    }
    acc[player.position].push(player)
    return acc
  }, {} as Record<string, FplRosterPlayer[]>)

  const positionOrder = ['GKP', 'DEF', 'MID', 'FWD'] as const
  const positionNames = {
    GKP: 'Goalkeepers',
    DEF: 'Defenders', 
    MID: 'Midfielders',
    FWD: 'Forwards'
  }

  return (
    <Card className="bg-green-50 border-4 border-green-600">
      <CardHeader>
        <CardTitle className="text-center">Your Squad</CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="space-y-6">
          {positionOrder.map((position, index) => {
            const players = playersByPosition[position] || []
            if (players.length === 0) return null

            return (
              <div key={position}>
                {index > 0 && <Separator className="my-6" />}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-700 text-center">
                    {positionNames[position]} ({players.length})
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {players.map(player => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardPanel>
    </Card>
  )
}
