import type { FplRosterPlayer } from '@/types/fpl'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTeamColors } from '@/types/teams'
import { DollarSign, TrendingUp, Target, Star, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerCardProps {
  player: FplRosterPlayer
}

function TeamJersey({ team }: { team: string }) {
  const colors = getTeamColors(team)

  return (
    <div className="relative w-12 h-14 mx-auto shrink-0">
      {/* Jersey Body */}
      <div
        className={`absolute inset-0 ${colors.primary} rounded-t-lg border-2 border-gray-400 shadow-sm`}
      >
        <JerseyPattern colors={colors} />
      </div>

      {/* Collar */}
      <div
        className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-1.5 ${colors.secondary} rounded-t-sm border border-gray-400`}
      />

      {/* Sleeves */}
      <div
        className={`absolute -left-0.5 top-1 w-1.5 h-3 ${colors.primary} rounded-l-md border border-gray-400`}
      />
      <div
        className={`absolute -right-0.5 top-1 w-1.5 h-3 ${colors.primary} rounded-r-md border border-gray-400`}
      />
    </div>
  )
}

function JerseyPattern({ colors }: { colors: ReturnType<typeof getTeamColors> }) {
  if (colors.pattern === "stripes") {
    return (
      <>
        <div
          className={`absolute left-1 top-1 bottom-1 w-1 ${colors.secondary}`}
        />
        <div
          className={`absolute left-3 top-1 bottom-1 w-1 ${colors.secondary}`}
        />
        <div
          className={`absolute right-3 top-1 bottom-1 w-1 ${colors.secondary}`}
        />
        <div
          className={`absolute right-1 top-1 bottom-1 w-1 ${colors.secondary}`}
        />
      </>
    )
  }

  if (colors.pattern === "half") {
    return (
      <div
        className={`absolute inset-x-0 top-0 h-1/2 ${colors.secondary} rounded-t-lg`}
      />
    )
  }

  if (colors.pattern === "navy-trim") {
    return (
      <div className="absolute inset-x-1 top-1 bottom-1 bg-blue-900 opacity-30 rounded" />
    )
  }

  // Default solid pattern - no additional elements needed
  return null
}

export function PlayerCard({ player }: PlayerCardProps) {
  const stats = [
    {
      label: 'Price',
      value: `£${player.price.toFixed(1)}m`,
      icon: <DollarSign className="h-2.5 w-2.5 text-emerald-600" />,
    },
    {
      label: 'Form',
      value: player.form.toFixed(1),
      icon: <TrendingUp className="h-2.5 w-2.5 text-emerald-600" />,
    },
    {
      label: 'PPG',
      value: player.pointsPerGame.toFixed(1),
      icon: <Target className="h-2.5 w-2.5 text-emerald-600" />,
    },
  ] as const

  return (
    <div className="relative w-[220px]">
      {(player.isCaptain || player.isViceCaptain) && (
        <div className="absolute left-3 top-3 z-20 space-y-2">
          {player.isCaptain && (
            <Badge
              variant="warning"
              size="sm"
              className="flex items-center gap-1 shadow-sm"
            >
              <Star className="h-3 w-3" />
              C
            </Badge>
          )}
          {player.isViceCaptain && (
            <Badge
              variant="secondary"
              size="sm"
              className="flex items-center gap-1 shadow-sm"
            >
              <Shield className="h-3 w-3" />
              V
            </Badge>
          )}
        </div>
      )}

      <Card className="h-auto w-full overflow-hidden rounded-3xl border-white/40 bg-white/95 px-3 py-4 shadow-[0_18px_35px_rgba(16,100,47,0.2)] backdrop-blur gap-1">
        <div className="flex flex-col gap-1">
          <TeamJersey team={player.team} />

          <div className="text-center">
            <div className="text-xs tracking-wider font-semibold uppercase text-emerald-800/80">
              {player.team}
            </div>
            <div className="mt-0.5 truncate text-base font-semibold text-slate-900">
              {player.name}
            </div>
          </div>
        </div>

        <div className="flex w-full gap-1 text-center text-[10px] text-slate-500 -mx-0.5 px-0.5 sm:flex-row mt-auto">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 px-1 py-1.5 min-w-0',
                  index > 0 && 'border-t-2 border-emerald-100/90 sm:border-t-0 sm:border-l-2'
                )}
              >
                <div className="flex items-center gap-0.5 text-[9px] uppercase tracking-widest text-emerald-700 whitespace-nowrap">
                  {stat.icon}
                  <span className="truncate">{stat.label}</span>
                </div>
                <div className="text-xs font-semibold text-slate-900 truncate w-full">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
      </Card>
    </div>
  )
}
