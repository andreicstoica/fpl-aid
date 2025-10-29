import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardFooter,
	CardHeader,
	CardPanel,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldControl,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { toastManager } from "@/components/ui/toast";
import { authClient } from "@/utils/auth-client";
import {
	type SignInFormData,
	type ValidationErrors,
	validateSignInField,
	validateSignInForm,
} from "@/utils/form-utils";

const DEFAULT_SIGNIN_ERROR =
	"An error occurred during sign in. Please try again.";
const INVALID_CREDENTIALS_ERROR =
	"Invalid email or password. Please check your credentials and try again.";

export const SignIn = () => {
	const navigate = useNavigate();
	const fieldIds = {
		email: "sign-in-email",
		password: "sign-in-password",
	} as const;
	const errorIds = {
		email: "sign-in-email-error",
		password: "sign-in-password-error",
	} as const;

	const signInMutation = useMutation({
		mutationFn: async ({
			email,
			password,
		}: {
			email: string;
			password: string;
		}) => {
			try {
				const result = await authClient.signIn.email({ email, password });

				if (result?.error) {
					const errorMessage = result.error.message || DEFAULT_SIGNIN_ERROR;
					const error = new Error(errorMessage);
					throw error;
				}

				if (!result?.data?.user) {
					throw new Error(INVALID_CREDENTIALS_ERROR);
				}

				return result;
			} catch (error: unknown) {
				if (
					error &&
					typeof error === "object" &&
					"status" in error &&
					(error.status === 401 || error.status === 422)
				) {
					throw new Error(INVALID_CREDENTIALS_ERROR);
				}

				if (error instanceof Error && error.message) {
					throw error;
				}

				throw new Error(DEFAULT_SIGNIN_ERROR);
			}
		},
		onSuccess: () => {
			navigate({ to: "/" });
		},
		onError: (error: unknown) => {
			console.error("Sign-in error:", error);

			const errorMessage =
				(error instanceof Error && error.message) ||
				(error &&
				typeof error === "object" &&
				"message" in error &&
				typeof error.message === "string"
					? error.message
					: null) ||
				DEFAULT_SIGNIN_ERROR;

			setAuthError(errorMessage);
		},
	});

	const [formData, setFormData] = useState<SignInFormData>({
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<ValidationErrors<SignInFormData>>({});
	const [authError, setAuthError] = useState<string | null>(null);

	const validateForm = () => {
		const newErrors = validateSignInForm(formData);
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange =
		(field: keyof SignInFormData) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData((prev) => ({ ...prev, [field]: e.target.value }));
			// Clear auth error when user starts typing
			if (authError) {
				setAuthError(null);
			}
			// Don't clear validation errors immediately - let them persist until validation runs again
		};

	const handleInputBlur = (field: keyof SignInFormData) => () => {
		// Validate individual field on blur
		const newErrors = validateSignInField(field, formData[field], errors);
		setErrors(newErrors);
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		// Clear any previous auth errors
		setAuthError(null);

		if (validateForm()) {
			const payload = { email: formData.email, password: formData.password };
			const mutationPromise = signInMutation.mutateAsync(payload);

			toastManager.promise(mutationPromise, {
				loading: {
					title: "Signing In...",
					description: "Authenticating your credentials...",
				},
				success: {
					title: "Signed In",
					description: "Welcome back! Redirecting to dashboard...",
				},
				error: (error) => ({
					title: "Sign In Failed",
					description:
						(error instanceof Error && error.message) || DEFAULT_SIGNIN_ERROR,
				}),
			});
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
			</CardHeader>
			<CardPanel>
				<Form onSubmit={handleSubmit} className="space-y-4">
					<Field>
						<FieldLabel htmlFor={fieldIds.email}>Email</FieldLabel>
						<FieldControl
							id={fieldIds.email}
							type="email"
							placeholder="Enter your email"
							value={formData.email}
							onChange={handleInputChange("email")}
							onBlur={handleInputBlur("email")}
							required
							aria-invalid={!!errors.email}
							aria-describedby={errors.email ? errorIds.email : undefined}
						/>
						{errors.email && (
							<FieldError id={errorIds.email}>{errors.email}</FieldError>
						)}
					</Field>

					<Field>
						<FieldLabel htmlFor={fieldIds.password}>Password</FieldLabel>
						<FieldControl
							id={fieldIds.password}
							type="password"
							placeholder="Enter your password"
							value={formData.password}
							onChange={handleInputChange("password")}
							onBlur={handleInputBlur("password")}
							required
							aria-invalid={!!errors.password}
							aria-describedby={errors.password ? errorIds.password : undefined}
						/>
						{errors.password && (
							<FieldError id={errorIds.password}>{errors.password}</FieldError>
						)}
					</Field>

					{authError && (
						<Alert variant="error">
							<AlertDescription>{authError}</AlertDescription>
						</Alert>
					)}

					<Button
						type="submit"
						className="w-full"
						disabled={signInMutation.isPending}
					>
						{signInMutation.isPending ? "Signing In..." : "Sign In"}
					</Button>
				</Form>
			</CardPanel>
			<CardFooter className="justify-center">
				<span className="text-sm text-muted-foreground">
					Don't have an account?{" "}
					<Link to="/sign-up" className="underline">
						Sign up
					</Link>
				</span>
			</CardFooter>
		</Card>
	);
};
