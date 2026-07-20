import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginFailure } from "@/features/auth/api/auth-api"
import { useAuth } from "@/features/auth/model/auth-context"
import { loginSchema, type LoginFormValues } from "@/features/auth/model/auth-schema"

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await login(values)
      const target = (location.state as { from?: string } | null)?.from ?? "/dashboard"
      navigate(target, { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof LoginFailure ? error.message : "An unexpected error occurred. Please try again."
      )
    }
  })

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Unable to sign in</AlertTitle>
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" autoComplete="current-password" aria-invalid={Boolean(errors.password)} {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button className="w-full" type="submit" disabled={isSubmitting}>
        {isSubmitting && <LoaderCircle className="animate-spin" />}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
