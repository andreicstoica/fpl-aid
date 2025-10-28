import { authClient } from "@/utils/auth-client"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardPanel, CardFooter } from "@/components/ui/card"
import { 
    SignInFormData, 
    ValidationErrors, 
    validateSignInForm, 
    validateSignInField 
} from "@/utils/form-utils"

export const SignIn = () => {
    const signInMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string, password: string }) => {
            return await authClient.signIn.email({ email, password })
        },
    })
    
    const [formData, setFormData] = useState<SignInFormData>({
        email: "",
        password: ""
    })
    const [errors, setErrors] = useState<ValidationErrors<SignInFormData>>({})

    const validateForm = () => {
        const newErrors = validateSignInForm(formData)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        // Don't clear errors immediately - let them persist until validation runs again
    }

    const handleInputBlur = (field: keyof SignInFormData) => () => {
        // Validate individual field on blur
        const newErrors = validateSignInField(field, formData[field], errors)
        setErrors(newErrors)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validateForm()) {
            signInMutation.mutate({ email: formData.email, password: formData.password })
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardPanel>
                <Form onSubmit={handleSubmit} className="space-y-4">
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
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange("password")}
                            onBlur={handleInputBlur("password")}
                            required
                            aria-invalid={!!errors.password}
                        />
                        {errors.password && <FieldError>{errors.password}</FieldError>}
                    </Field>
                    
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
                    <a href="/sign-up" className="underline">
                        Sign up
                    </a>
                </span>
            </CardFooter>
        </Card>
    )
}