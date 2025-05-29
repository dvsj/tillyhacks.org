"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [loginErrorOpen, setLoginErrorOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const { supabase } = useSupabase()
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setErrorMessage("Incorrect password or email. Please try again.")
        setLoginErrorOpen(true)
      } else if (data.user) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setErrorMessage("Incorrect password or email. Please try again.")
      setLoginErrorOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setErrorMessage("GitHub login failed. Please try again.")
        setLoginErrorOpen(true)
      }
    } catch (error) {
      setErrorMessage("GitHub login failed. Please try again.")
      setLoginErrorOpen(true)
    } finally {
      setIsGitHubLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Card className="w-[450px] shadow-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2">
              <img src="/logo.png" alt="TillyHacks Logo" className="h-12 w-12" />
              <h1 className="text-4xl font-bold">
                <span className="text-primary">Tilly</span>Hacks
              </h1>
            </div>
          </Link>
          <CardTitle className="text-2xl">login</CardTitle>
          <CardDescription>sign in to register for the hackathon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "signing in..." : "log in"}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setForgotPasswordOpen(true)}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              forgot password?
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button onClick={handleGitHubSignIn} disabled={isGitHubLoading} variant="outline" className="w-full">
            <i className="fab fa-github mr-2"></i>
            {isGitHubLoading ? "signing in..." : "sign in with github"}
          </Button>

          <div className="text-center">
            <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">
              don't have an account? register
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Login Error Dialog */}
      <Dialog open={loginErrorOpen} onOpenChange={setLoginErrorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login Failed</DialogTitle>
            <DialogDescription>{errorMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setLoginErrorOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Reset</DialogTitle>
            <DialogDescription>
              Please contact us at hello [at] tillyhacks [dot] org for password reset assistance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setForgotPasswordOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
