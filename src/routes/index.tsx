import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { SignIn } from '@/components/auth/SignIn'
import { authClient } from '@/utils/auth-client'
import type { FplRosterPlayer } from '@/types/fpl'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (session?.user) {
    return <RosterDisplay />
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Welcome!</h1>
        <SignIn />
      </div>
    </div>
  )
}

function RosterDisplay() {
  type RosterResponse = {
    roster: FplRosterPlayer[]
    needsSetup?: boolean
    message?: string
  }

  const { data: rosterData, isLoading, error } = useQuery<RosterResponse>({
    queryKey: ['fpl-roster'],
    queryFn: async () => {
      const response = await fetch('/api/fpl-roster')
      if (!response.ok) {
        throw new Error('Failed to fetch roster')
      }
      return response.json()
    },
    retry: false
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading your FPL roster...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error loading roster</h1>
          <p className="text-gray-600">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  const roster: FplRosterPlayer[] = rosterData?.roster || []
  const needsSetup = rosterData?.needsSetup

  if (needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Let’s finish setting things up</h1>
          <p className="text-gray-600">
            We couldn’t find an FPL team linked to your account yet. Please update your profile with your FPL details to view your roster.
          </p>
        </div>
      </div>
    )
  }

  // Group players by position
  const playersByPosition = roster.reduce((acc, player) => {
    if (!acc[player.position]) {
      acc[player.position] = []
    }
    acc[player.position].push(player)
    return acc
  }, {} as Record<string, FplRosterPlayer[]>)

  const positionOrder = ['GKP', 'DEF', 'MID', 'FWD']
  const positionNames = {
    GKP: 'Goalkeepers',
    DEF: 'Defenders', 
    MID: 'Midfielders',
    FWD: 'Forwards'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Your FPL Roster</h1>
        
        {roster.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No players found in your roster.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {positionOrder.map(position => {
              const players = playersByPosition[position] || []
              if (players.length === 0) return null

              return (
                <div key={position} className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">
                    {positionNames[position as keyof typeof positionNames]} ({players.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {players.map(player => (
                      <div 
                        key={player.id} 
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{player.name}</h3>
                          <span className="text-sm text-gray-500">{player.team}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Price: £{player.price.toFixed(1)}m</div>
                          <div>Points: {player.totalPoints}</div>
                          <div>Form: {player.form.toFixed(1)}</div>
                          <div>PPG: {player.pointsPerGame.toFixed(1)}</div>
                          {player.isCaptain && (
                            <div className="text-yellow-600 font-medium">© Captain</div>
                          )}
                          {player.isViceCaptain && (
                            <div className="text-gray-500">Vice Captain</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
