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
                toastManager.add({
                    type: 'success',
                    title: 'Account Created!',
                    description: 'Welcome to FPL Aid! Redirecting to dashboard...',
                })
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    navigate({ to: '/' })
                }, 1500)
            }
        },
        onError: (error) => {
            try {
                const errorData = JSON.parse(error.message) as SignUpResponse
                
                if (errorData.errors?.fplTeamId) {
                    setErrors(prev => ({ ...prev, fplTeamId: errorData.errors!.fplTeamId }))
                }
                if (errorData.errors?.fplLeagueId) {
                    setErrors(prev => ({ ...prev, fplLeagueId: errorData.errors!.fplLeagueId }))
                }
                if (errorData.errors?.general) {
                    toastManager.add({
                        type: 'error',
                        title: 'Signup Failed',
                        description: errorData.errors.general,
                    })
                }
            } catch {
                toastManager.add({
                    type: 'error',
                    title: 'Signup Failed',
                    description: 'An unexpected error occurred. Please try again.',
                })
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
            // Show loading toast
            toastManager.add({
                type: 'loading',
                title: 'Creating Account...',
                description: 'Validating FPL data and creating your account...',
            })
            
            signUpMutation.mutate({ 
                name: formData.name, 
                email: formData.email, 
                password: formData.password, 
                fplTeamId: formData.fplTeamId, 
                fplLeagueId: formData.fplLeagueId, 
                favoriteTeam: formData.favoriteTeam 
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
                        <FieldLabel>Full Name</FieldLabel>
                        <FieldControl
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleInputChange("name")}
                            onBlur={handleInputBlur("name")}
                            required
                            aria-invalid={!!errors.name}
                        />
                        {errors.name && <FieldError>{errors.name}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <FieldControl
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleInputChange("email")}
                            onBlur={handleInputBlur("email")}
                            required
                            aria-invalid={!!errors.email}
                        />
                        {errors.email && <FieldError>{errors.email}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>Password</FieldLabel>
                        <FieldControl
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleInputChange("password")}
                            onBlur={handleInputBlur("password")}
                            required
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && <FieldError>{errors.password}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>FPL Team ID</FieldLabel>
                        <FieldControl
                            type="number"
                            placeholder="Enter your FPL team ID"
                            value={formData.fplTeamId}
                            onChange={handleInputChange("fplTeamId")}
                            onBlur={handleInputBlur("fplTeamId")}
                            required
                            aria-invalid={!!errors.fplTeamId}
                        />
                        {errors.fplTeamId && <FieldError>{errors.fplTeamId}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>FPL League ID</FieldLabel>
                        <FieldControl
                            type="number"
                            placeholder="Enter your FPL league ID"
                            value={formData.fplLeagueId}
                            onChange={handleInputChange("fplLeagueId")}
                            onBlur={handleInputBlur("fplLeagueId")}
                            required
                            aria-invalid={!!errors.fplLeagueId}
                        />
                        {errors.fplLeagueId && <FieldError>{errors.fplLeagueId}</FieldError>}
                    </Field>

                    <Field>
                        <FieldLabel>Favorite Team</FieldLabel>
                        <Select 
                            value={formData.favoriteTeam} 
                            onValueChange={handleSelectChange("favoriteTeam")}
                        >
                            <SelectTrigger aria-invalid={!!errors.favoriteTeam}>
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
                        {errors.favoriteTeam && <FieldError>{errors.favoriteTeam}</FieldError>}
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