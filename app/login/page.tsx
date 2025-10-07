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

  // Login is disabled for interest-only phase. will restore this page when registration opens.
  return null
}
