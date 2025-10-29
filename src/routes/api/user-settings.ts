import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/utils/auth'
import { getUserFplData } from '@/utils/user-fpl'

export const Route = createFileRoute('/api/user-settings')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          // Get current session
          const session = await auth.api.getSession({
            headers: request.headers
          })

          if (!session?.user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 })
          }

          // Fetch user FPL data from database
          const userFplData = await getUserFplData(session.user.id)

          return Response.json({
            fplTeamId: userFplData?.fplTeamId || '',
            fplLeagueId: userFplData?.fplLeagueId || '',
          })

        } catch (error) {
          console.error('Error fetching user settings:', error)
          return Response.json({ 
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 })
        }
      }
    }
  }
})

