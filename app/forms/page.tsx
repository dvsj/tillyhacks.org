"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import Link from "next/link"

interface FormStatus {
  attendee: boolean
  parent: boolean
  waiver: boolean
}

export default function FormsPage() {
  const [formStatus, setFormStatus] = useState<FormStatus>({
    attendee: false,
    parent: false,
    waiver: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to access forms.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      await checkFormStatus()
    }

    checkAuth()
  }, [])

  const checkFormStatus = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const userId = userData.user.id

      const [attendeeResult, parentResult, waiverResult] = await Promise.all([
        supabase.from("attendee_forms").select("id").eq("user_id", userId).single(),
        supabase.from("parent_forms").select("id").eq("user_id", userId).single(),
        supabase.from("waiver_forms").select("id").eq("user_id", userId).single(),
      ])

      setFormStatus({
        attendee: !!attendeeResult.data,
        parent: !!parentResult.data,
        waiver: !!waiverResult.data,
      })
    } catch (error) {
      console.error("Error checking form status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const forms = [
    {
      id: "attendee",
      title: "Attendee Form",
      description: "Basic info about you and any dietary restrictions",
      href: "/forms/attendee",
      completed: formStatus.attendee,
    },
    {
      id: "parent",
      title: "Parent/Guardian Form",
      description: "Contact info for your parent or guardian",
      href: "/forms/parent",
      completed: formStatus.parent,
    },
    {
      id: "waiver",
      title: "Liability Waiver",
      description: "Legal stuff - boring but necessary",
      href: "/forms/waiver",
      completed: formStatus.waiver,
    },
  ]

  const completedCount = Object.values(formStatus).filter(Boolean).length
  const totalForms = forms.length
  const allCompleted = completedCount === totalForms

  // All forms are hidden for interest-only phase. Will restore this page when registration opens.
  return null
}
