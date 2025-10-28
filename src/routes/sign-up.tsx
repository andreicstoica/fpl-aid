import { createFileRoute } from '@tanstack/react-router'
import { SignUp } from '@/components/auth/SignUp'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp />
    </div>
  )
}
