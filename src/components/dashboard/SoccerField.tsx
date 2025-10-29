import type { FplRosterPlayer } from '@/types/fpl'
import { PlayerCard } from './PlayerCard'
import { Card, CardHeader, CardTitle, CardPanel } from '@/components/ui/card'

interface SoccerFieldProps {
  roster: FplRosterPlayer[]
}

export function SoccerField({ roster }: SoccerFieldProps) {
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
    FWD: 'Forwards',
  }

  return (
    <Card className="border-none bg-transparent p-0 shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-2xl font-semibold text-emerald-900">
          Your Squad
        </CardTitle>
      </CardHeader>
      <CardPanel className="px-0 pb-0">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-[42px] border-[14px] border-emerald-900/70 bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 shadow-[0_40px_80px_rgba(12,83,32,0.35)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-[18px] rounded-[32px] border-2 border-white/25" />
              <div className="absolute inset-y-12 left-1/2 w-px -translate-x-1/2 bg-white/30" />
              <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
              <div className="absolute inset-x-[18%] top-12 h-28 rounded-b-[120px] border-2 border-white/20" />
              <div className="absolute inset-x-[28%] top-24 h-14 rounded-b-[60px] border-2 border-white/25" />
              <div className="absolute inset-x-[18%] bottom-12 h-28 rounded-t-[120px] border-2 border-white/20" />
              <div className="absolute inset-x-[28%] bottom-24 h-14 rounded-t-[60px] border-2 border-white/25" />
              <div className="absolute left-1/2 top-[19%] h-2 w-2 -translate-x-1/2 rounded-full bg-white/70" />
              <div className="absolute left-1/2 bottom-[19%] h-2 w-2 -translate-x-1/2 rounded-full bg-white/70" />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
            </div>

            <div className="relative z-10 flex flex-col gap-12 px-6 py-12 md:px-12">
              {positionOrder.map(position => {
                const players = playersByPosition[position] || []
                if (players.length === 0) return null

                return (
                  <div key={position} className="space-y-6">
                    <div className="text-center text-xs font-semibold uppercase tracking-[0.4em] text-emerald-50/80">
                      {positionNames[position]}
                    </div>
                    <div className="flex flex-wrap justify-center gap-5">
                      {players.map(player => (
                        <PlayerCard key={player.id} player={player} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardPanel>
    </Card>
  )
}
