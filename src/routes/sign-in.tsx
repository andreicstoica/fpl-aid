import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@/components/auth/SignIn";

export const Route = createFileRoute("/sign-in")({
	component: SignInPage,
});

function SignInPage() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<SignIn />
		</div>
	);
}
