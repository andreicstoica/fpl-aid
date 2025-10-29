import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/components/auth/SignIn'
import { authClient } from '@/utils/auth-client'
import { Dashboard } from '@/components/dashboard/Dashboard'

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
    return <Dashboard />
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

