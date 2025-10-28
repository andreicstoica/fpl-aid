import { authClient } from "@/utils/auth-client"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardPanel } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/components/ui/select"
import { PREMIER_LEAGUE_TEAMS } from "@/types/teams"
import { 
    SignUpFormData, 
    ValidationErrors, 
    validateSignUpForm, 
    validateSignUpField 
} from "@/utils/form-utils"

export const SignUp = () => {
    const signUpMutation = useMutation({
        mutationFn: async ({ 
            name, 
            email, 
            password, 
            fplTeamId: _fplTeamId,
            fplLeagueId: _fplLeagueId,
            favoriteTeam: _favoriteTeam
        }: { 
            name: string
            email: string
            password: string
            fplTeamId: string
            fplLeagueId: string
            favoriteTeam: string
        }) => {
            // For now, just pass the basic auth fields
            // TODO: Update auth client to handle FPL fields
            return await authClient.signUp.email({ 
                email, 
                password,
                name
            })
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
            // TODO: Store FPL data when auth client supports it
            console.log('FPL Data:', { 
                fplTeamId: formData.fplTeamId, 
                fplLeagueId: formData.fplLeagueId, 
                favoriteTeam: formData.favoriteTeam 
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
        </Card>
    )
}