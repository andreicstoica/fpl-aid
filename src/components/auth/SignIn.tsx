import { authClient } from "@/utils/auth-client"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate, Link } from "@tanstack/react-router"
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field"
import { Form } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardPanel, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
    SignInFormData, 
    ValidationErrors, 
    validateSignInForm, 
    validateSignInField 
} from "@/utils/form-utils"

export const SignIn = () => {
    const navigate = useNavigate()
    
    const signInMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string, password: string }) => {
            return await authClient.signIn.email({ email, password })
        },
        onSuccess: (data) => {
            // Check if the response contains an error
            if (data?.error) {
                setAuthError(data.error.message || 'An error occurred during sign in.')
                return
            }
            
            // Check if user is null (indicating failed authentication)
            if (!data?.data?.user) {
                setAuthError('Invalid email or password. Please check your credentials and try again.')
                return
            }
            
            navigate({ to: '/' })
        },
        onError: (error: any) => {
            console.error('Sign-in error:', error)
            
            // Extract error message from Better Auth error response
            let errorMessage = 'An error occurred during sign in. Please try again.'
            
            if (error?.message) {
                errorMessage = error.message
            } else if (error?.status === 401) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.'
            } else if (error?.status === 422) {
                errorMessage = 'Invalid email or password. Please check your credentials and try again.'
            }
            
            setAuthError(errorMessage)
        },
    })
    
    const [formData, setFormData] = useState<SignInFormData>({
        email: "",
        password: ""
    })
    const [errors, setErrors] = useState<ValidationErrors<SignInFormData>>({})
    const [authError, setAuthError] = useState<string | null>(null)

    const validateForm = () => {
        const newErrors = validateSignInForm(formData)
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (field: keyof SignInFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }))
        // Clear auth error when user starts typing
        if (authError) {
            setAuthError(null)
        }
        // Don't clear validation errors immediately - let them persist until validation runs again
    }

    const handleInputBlur = (field: keyof SignInFormData) => () => {
        // Validate individual field on blur
        const newErrors = validateSignInField(field, formData[field], errors)
        setErrors(newErrors)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // Clear any previous auth errors
        setAuthError(null)
        
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
    )
}