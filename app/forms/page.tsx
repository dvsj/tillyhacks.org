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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">registration forms</h1>
          <p className="text-lg text-muted-foreground mb-4">
            fill out all these forms to secure your spot. yeah it's annoying but we need this stuff for legal reasons.
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Progress:</span>
            <Badge variant={allCompleted ? "default" : "secondary"}>
              {completedCount}/{totalForms} completed
            </Badge>
          </div>
        </div>

        {allCompleted && (
          <Card className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">🎉 you're all set!</h2>
              <p className="text-green-700 dark:text-green-300">all forms completed. we'll see you at the hackathon!</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {forms.map((form) => (
            <Card
              key={form.id}
              className={`transition-all hover:shadow-md ${form.completed ? "border-green-200" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{form.title}</CardTitle>
                  {form.completed && <Badge className="bg-green-100 text-green-800">✓ Done</Badge>}
                </div>
                <CardDescription>{form.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={form.href}>
                  <Button className="w-full" variant={form.completed ? "outline" : "default"}>
                    {form.completed ? "View/Edit" : "Fill Out"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            having issues? email us at{" "}
            <a href="mailto:hello@tillyhacks.org" className="text-primary hover:underline">
              hello [at] tillyhacks [dot] org
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
