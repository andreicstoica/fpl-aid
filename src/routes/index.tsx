import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/components/auth/SignIn'
import { authClient } from '@/utils/auth-client'

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Success! You are logged in.</h1>
        </div>
      </div>
    )
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
