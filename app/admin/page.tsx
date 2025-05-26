"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import Header from "@/components/header"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

type Submission = {
  id: number
  created_at: string
  user_id: string
  user_email?: string
  user_name?: string
  form_type: string
  form_data: any
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const { toast } = useToast()
  const { supabase } = useSupabase()

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchSubmissions()
    } else {
      toast({
        title: "Authentication failed",
        description: "Incorrect password.",
        variant: "destructive",
      })
    }
  }

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      // Create a temporary admin session
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        console.log("Current user:", userData.user.id)
      }

      // First, fetch all profiles to create a lookup map
      const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("id, name, email")

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        throw profilesError
      }

      console.log("Profiles data:", profilesData)

      // Create a lookup map for profiles
      const profilesMap: Record<string, { name: string; email: string }> = {}
      profilesData?.forEach((profile) => {
        profilesMap[profile.id] = {
          name: profile.name,
          email: profile.email,
        }
      })

      // Fetch parent forms
      const { data: parentFormsData, error: parentFormsError } = await supabase.from("parent_forms").select("*")

      if (parentFormsError) {
        console.error("Error fetching parent forms:", parentFormsError)
        throw parentFormsError
      }

      console.log("Parent forms data:", parentFormsData)

      // Fetch attendee forms
      const { data: attendeeFormsData, error: attendeeFormsError } = await supabase.from("attendee_forms").select("*")

      if (attendeeFormsError) {
        console.error("Error fetching attendee forms:", attendeeFormsError)
        throw attendeeFormsError
      }

      console.log("Attendee forms data:", attendeeFormsData)

      // Fetch waiver forms
      const { data: waiverFormsData, error: waiverFormsError } = await supabase.from("waiver_forms").select("*")

      if (waiverFormsError) {
        console.error("Error fetching waiver forms:", waiverFormsError)
        throw waiverFormsError
      }

      console.log("Waiver forms data:", waiverFormsData)

      // Format the data
      const formattedParentForms =
        parentFormsData?.map((form) => {
          const profile = profilesMap[form.user_id]
          return {
            id: form.id,
            created_at: form.created_at,
            user_id: form.user_id,
            user_name: profile ? profile.name : "Unknown user",
            user_email: profile ? profile.email : "Unknown email",
            form_type: "Parent Form",
            form_data: {
              parent_name: form.parent_name,
              contact_number: form.contact_number,
              emergency_contact: form.emergency_contact,
            },
          }
        }) || []

      const formattedAttendeeforms =
        attendeeFormsData?.map((form) => {
          const profile = profilesMap[form.user_id]
          return {
            id: form.id,
            created_at: form.created_at,
            user_id: form.user_id,
            user_name: profile ? profile.name : "Unknown user",
            user_email: profile ? profile.email : "Unknown email",
            form_type: "Attendee Form",
            form_data: {
              attendee_name: form.attendee_name,
              dietary_restrictions: form.dietary_restrictions,
            },
          }
        }) || []

      const formattedWaiverForms =
        waiverFormsData?.map((form) => {
          const profile = profilesMap[form.user_id]
          return {
            id: form.id,
            created_at: form.created_at,
            user_id: form.user_id,
            user_name: profile ? profile.name : "Unknown user",
            user_email: profile ? profile.email : "Unknown email",
            form_type: "Waiver Form",
            form_data: {
              waiver_agreement: form.waiver_agreement,
              signature: form.signature,
            },
          }
        }) || []

      // Combine all submissions
      const allSubmissions = [...formattedParentForms, ...formattedAttendeeforms, ...formattedWaiverForms].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )

      console.log("All submissions:", allSubmissions)
      setSubmissions(allSubmissions)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch submissions. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-8">View all form submissions from TillyHacks participants.</p>

        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Admin Authentication</CardTitle>
              <CardDescription>Enter the admin password to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthenticate} className="space-y-4">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button type="submit" className="w-full">
                  Authenticate
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : submissions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>No submissions found.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <Card key={`${submission.form_type}-${submission.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-semibold">{submission.form_type}</h3>
                          <p className="text-sm text-muted-foreground">
                            Submitted by: {submission.user_name || "Unknown"} ({submission.user_email || "No email"})
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted at: {formatDate(submission.created_at)}
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" onClick={() => setSelectedSubmission(submission)}>
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Submission Details</DialogTitle>
                              <DialogDescription>
                                {submission.form_type} submitted by {submission.user_name || "Unknown"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              {selectedSubmission && (
                                <>
                                  <div>
                                    <h4 className="font-medium">User Information</h4>
                                    <p>Name: {selectedSubmission.user_name || "Unknown"}</p>
                                    <p>Email: {selectedSubmission.user_email || "No email"}</p>
                                    <p>Submitted: {formatDate(selectedSubmission.created_at)}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">Form Data</h4>
                                    {Object.entries(selectedSubmission.form_data).map(([key, value]) => (
                                      <p key={key}>
                                        {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:{" "}
                                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value || "Not provided"}
                                      </p>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                            <DialogClose asChild>
                              <Button className="mt-4">Close</Button>
                            </DialogClose>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
