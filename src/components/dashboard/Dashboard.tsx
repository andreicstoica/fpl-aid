import { useQuery } from '@tanstack/react-query'
import type { FplDashboardData } from '@/types/fpl'
import { ManagerStats } from './ManagerStats'
import { LeagueStats } from './LeagueStats'
import { SoccerField } from './SoccerField'
import { Skeleton } from '@/components/ui/skeleton'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export function Dashboard() {
  const { data: dashboardData, isLoading, error } = useQuery<FplDashboardData>({
    queryKey: ['fpl-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/fpl-dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      return response.json()
    },
    retry: false
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="mx-auto px-4 w-full">
          <Skeleton className="h-10 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="mx-auto px-4 w-full">
          <Alert variant="error" className="max-w-2xl mx-auto">
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription>{(error as Error).message}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8">
        <div className="mx-auto px-4 w-full">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No dashboard data available</EmptyTitle>
              <EmptyDescription>Please check your FPL team connection.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </div>
    )
  }

  const { roster, manager, league } = dashboardData

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4">        
        {/* Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {manager && <ManagerStats manager={manager} />}
          {league && <LeagueStats league={league} />}
        </div>
        
        {/* Soccer Field */}
        <SoccerField roster={roster} />
      </div>
    </div>
  )
}
