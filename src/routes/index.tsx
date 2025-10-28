import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@/components/auth/SignIn'
import { SignUp } from '@/components/auth/SignUp'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">working</h1>
      <SignIn />
      <SignUp />
    </div>
  )
}
