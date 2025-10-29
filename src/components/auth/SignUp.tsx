import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardPanel, CardFooter } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/components/ui/select"
import { toastManager } from "@/components/ui/toast"
import { PREMIER_LEAGUE_TEAMS } from "@/types/teams"
import { 
    SignUpFormData, 
    ValidationErrors, 
    validateSignUpForm, 
    validateSignUpField 
} from "@/utils/form-utils"
import type { SignUpPayload, SignUpResponse } from "@/types/signup"

export const SignUp = () => {
    const navigate = useNavigate()
    const fieldIds = {
        name: "sign-up-name",
        email: "sign-up-email",
        password: "sign-up-password",
        fplTeamId: "sign-up-fpl-team-id",
        fplLeagueId: "sign-up-fpl-league-id",
        favoriteTeam: "sign-up-favorite-team",
    } as const
    const errorIds = {
        name: "sign-up-name-error",
        email: "sign-up-email-error",
        password: "sign-up-password-error",
        fplTeamId: "sign-up-fpl-team-id-error",
        fplLeagueId: "sign-up-fpl-league-id-error",
        favoriteTeam: "sign-up-favorite-team-error",
    } as const
    const extractErrorResponse = (error: unknown): SignUpResponse | null => {
        if (error instanceof Error) {
            try {
                return JSON.parse(error.message) as SignUpResponse
            } catch {
                return null
            }
        }
        return null
    }
    
    const signUpMutation = useMutation({
        mutationFn: async (payload: SignUpPayload): Promise<SignUpResponse> => {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(JSON.stringify(errorData))
            }
            
            return await response.json()
        },
        onSuccess: (data) => {
            if (data.success) {
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    navigate({ to: '/' })
                }, 1500)
            }
        },
        onError: (error) => {
            const errorData = extractErrorResponse(error)
            
            if (errorData?.errors?.fplTeamId) {
                setErrors(prev => ({ ...prev, fplTeamId: errorData.errors!.fplTeamId }))
            }
            if (errorData?.errors?.fplLeagueId) {
                setErrors(prev => ({ ...prev, fplLeagueId: errorData.errors!.fplLeagueId }))
            }
        },
    })
    const [formData, setFormData] = useState<SignUpFormData>({
        name: "",
        email: "",
        password: "",
        fplTeamId: "",
        fplLeagueId: "",
        favoriteTeam: ""
    })
    const [errors, setErrors] = useState<ValidationErrors<SignUpFormData>>({})

    const validateForm = () => {
        const newErrors = validateSignUpForm(formData)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof SignUpFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
    }

    const handleInputBlur = (field: keyof SignUpFormData) => () => {
        // Validate individual field on blur
        const newErrors = validateSignUpField(field, formData[field], errors)
        setErrors(newErrors)
    }

    const handleSelectChange = (field: keyof SignUpFormData) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validateForm()) {
            const payload: SignUpPayload = {
                name: formData.name, 
                email: formData.email, 
                password: formData.password, 
                fplTeamId: formData.fplTeamId, 
                fplLeagueId: formData.fplLeagueId, 
                favoriteTeam: formData.favoriteTeam 
            }

            const mutationPromise = signUpMutation.mutateAsync(payload)

            toastManager.promise(mutationPromise, {
                loading: {
                    title: 'Creating Account...',
                    description: 'Validating FPL data and creating your account...',
                    timeout: 0,
                },
                success: () => ({
                    title: 'Account Created!',
                    description: 'Welcome to FPL Aid! Redirecting to dashboard...',
                }),
                error: (error) => {
                    const errorData = extractErrorResponse(error)
                    return {
                        title: 'Signup Failed',
                        description: errorData?.errors?.general ?? 'An unexpected error occurred. Please try again.',
                    }
                },
            })
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
            </CardHeader>
            <CardPanel>
                <Form onSubmit={handleSubmit} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor={fieldIds.name}>Full Name</FieldLabel>
                        <FieldControl
                            id={fieldIds.name}
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            onBlur={handleInputBlur("name")}
                            required
                            aria-invalid={!!errors.name}
                            aria-describedby={errors.name ? errorIds.name : undefined}
                        />
                        {errors.name && (
                            <FieldError id={errorIds.name}>{errors.name}</FieldError>
                        )}
                    </Field>

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
                            placeholder="Create a password"
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

                    <Field>
                        <FieldLabel htmlFor={fieldIds.fplTeamId}>FPL Team ID</FieldLabel>
                        <FieldControl
                            id={fieldIds.fplTeamId}
                            type="number"
                            placeholder="Enter your FPL team ID"
                            value={formData.fplTeamId}
                            onChange={handleInputChange("fplTeamId")}
                            onBlur={handleInputBlur("fplTeamId")}
                            required
                            aria-invalid={!!errors.fplTeamId}
                            aria-describedby={errors.fplTeamId ? errorIds.fplTeamId : undefined}
                        />
                        {errors.fplTeamId && (
                            <FieldError id={errorIds.fplTeamId}>{errors.fplTeamId}</FieldError>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor={fieldIds.fplLeagueId}>FPL League ID</FieldLabel>
                        <FieldControl
                            id={fieldIds.fplLeagueId}
                            type="number"
                            placeholder="Enter your FPL league ID"
                            value={formData.fplLeagueId}
                            onChange={handleInputChange("fplLeagueId")}
                            onBlur={handleInputBlur("fplLeagueId")}
                            required
                            aria-invalid={!!errors.fplLeagueId}
                            aria-describedby={
                                errors.fplLeagueId ? errorIds.fplLeagueId : undefined
                            }
                        />
                        {errors.fplLeagueId && (
                            <FieldError id={errorIds.fplLeagueId}>{errors.fplLeagueId}</FieldError>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor={fieldIds.favoriteTeam}>
                            Favorite Team
                        </FieldLabel>
                        <Select 
                            value={formData.favoriteTeam} 
                            onValueChange={handleSelectChange("favoriteTeam")}
                        >
                            <SelectTrigger
                                id={fieldIds.favoriteTeam}
                                aria-invalid={!!errors.favoriteTeam}
                                aria-describedby={
                                    errors.favoriteTeam ? errorIds.favoriteTeam : undefined
                                }
                            >
                                <SelectValue>
                                    {formData.favoriteTeam || "Select your favorite team"}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectPopup>
                                {PREMIER_LEAGUE_TEAMS.map((team) => (
                                    <SelectItem key={team.id} value={team.name}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectPopup>
                        </Select>
                        {errors.favoriteTeam && (
                            <FieldError id={errorIds.favoriteTeam}>
                                {errors.favoriteTeam}
                            </FieldError>
                        )}
                    </Field>
                    
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={signUpMutation.isPending}
                    >
                        {signUpMutation.isPending ? "Creating Account..." : "Sign Up"}
                    </Button>
                </Form>
            </CardPanel>
            <CardFooter className="justify-center">
                <span className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/sign-in" className="underline">
                        Sign in
                    </Link>
                </span>
            </CardFooter>
        </Card>
    )
}
