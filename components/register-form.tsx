"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"

export function RegisterForm() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const { toast } = useToast()
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter your first and last name",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      })

      if (error) {
        console.error("Signup error:", error)
        let errorMessage = "Registration failed. Please try again."

        if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Try logging in instead."
        } else if (error.message.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message.includes("Password")) {
          errorMessage = "Password must be at least 6 characters long."
        }

        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        // Send Discord notification for new user
        try {
          await fetch("/api/discord-webhook", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "new_user",
              action: "registered",
              data: {
                name: `${firstName} ${lastName}`,
                email: email,
                method: "email",
              },
            }),
          })
        } catch (webhookError) {
          console.error("Discord webhook error:", webhookError)
        }

        if (!data.user.email_confirmed_at) {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Check your email to complete registration.",
          })
        } else {
          toast({
            title: "Registration successful",
            description: "Welcome to TillyHacks!",
          })
          router.push("/")
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignUp = async () => {
    setIsGitHubLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGitHubLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleEmailSignUp} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="Enter your password (min 6 characters)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            placeholder="Confirm your password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "creating account..." : "create account"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Button onClick={handleGitHubSignUp} disabled={isGitHubLoading} variant="outline" className="w-full">
        <i className="fab fa-github mr-2"></i>
        {isGitHubLoading ? "signing up..." : "sign up with github"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        by creating an account, you agree to our terms and privacy policy
      </p>
    </div>
  )
}
