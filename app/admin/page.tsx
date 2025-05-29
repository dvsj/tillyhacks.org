"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { authenticateAdmin } from "./admin-actions"
import { useSupabase } from "@/components/supabase-provider"
import { Download } from "lucide-react"

interface AttendeeForm {
  id: number
  created_at: string
  updated_at?: string
  attendee_name: string
  school?: string
  grade_level?: string
  programming_experience?: string
  preferred_languages?: string[]
  tshirt_size?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  how_did_you_hear?: string
  what_to_learn?: string
  team_preference?: string
  dietary_restrictions: string | null
  profiles: {
    name: string
    email: string
  }
}

interface ParentForm {
  id: number
  created_at: string
  updated_at?: string
  parent_name: string
  contact_number: string
  emergency_contact: string
  profiles: {
    name: string
    email: string
  }
}

interface WaiverForm {
  id: number
  created_at: string
  updated_at?: string
  waiver_agreement: boolean
  signature: string
  profiles: {
    name: string
    email: string
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attendeeForms, setAttendeeForms] = useState<AttendeeForm[]>([])
  const [parentForms, setParentForms] = useState<ParentForm[]>([])
  const [waiverForms, setWaiverForms] = useState<WaiverForm[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const { toast } = useToast()
  const { supabase } = useSupabase()

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const isValid = await authenticateAdmin(password)
      if (isValid) {
        setIsAuthenticated(true)
        toast({
          title: "authentication successful",
          description: "welcome to the admin dashboard",
        })
        await loadAllData()
      } else {
        toast({
          title: "authentication failed",
          description: "wrong password, try again",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "error",
        description: "something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadAllData = async () => {
    setDataLoading(true)
    try {
      const [attendeeResult, parentResult, waiverResult] = await Promise.all([
        supabase
          .from("attendee_forms")
          .select(`
            *,
            profiles (
              name,
              email
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("parent_forms")
          .select(`
            *,
            profiles (
              name,
              email
            )
          `)
          .order("created_at", { ascending: false }),
        supabase
          .from("waiver_forms")
          .select(`
            *,
            profiles (
              name,
              email
            )
          `)
          .order("created_at", { ascending: false }),
      ])

      if (attendeeResult.data) setAttendeeForms(attendeeResult.data)
      if (parentResult.data) setParentForms(parentResult.data)
      if (waiverResult.data) setWaiverForms(waiverResult.data)
    } catch (error) {
      toast({
        title: "error loading data",
        description: "failed to load form submissions",
        variant: "destructive",
      })
    } finally {
      setDataLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const convertToCSV = (data: any[], headers: string[]) => {
    // Create header row
    let csvContent = headers.join(",") + "\n"

    // Add data rows
    data.forEach((item) => {
      const row = headers.map((header) => {
        // Handle nested properties like profiles.name
        if (header.includes(".")) {
          const [parent, child] = header.split(".")
          return item[parent] && item[parent][child] ? `"${item[parent][child]}"` : '""'
        }

        // Handle arrays
        if (Array.isArray(item[header])) {
          return `"${item[header].join("; ")}"`
        }

        // Handle regular values, escape quotes and wrap in quotes
        const value = item[header] !== null && item[header] !== undefined ? item[header].toString() : ""
        return `"${value.replace(/"/g, '""')}"`
      })
      csvContent += row.join(",") + "\n"
    })

    return csvContent
  }

  const downloadCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = convertToCSV(data, headers)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    // Create a URL for the blob
    const url = URL.createObjectURL(blob)

    // Set link properties
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"

    // Add to document, click and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAttendeeData = () => {
    const headers = [
      "id",
      "created_at",
      "updated_at",
      "attendee_name",
      "school",
      "grade_level",
      "programming_experience",
      "preferred_languages",
      "tshirt_size",
      "emergency_contact_name",
      "emergency_contact_phone",
      "how_did_you_hear",
      "what_to_learn",
      "team_preference",
      "dietary_restrictions",
      "profiles.name",
      "profiles.email",
    ]
    downloadCSV(attendeeForms, "tillyhacks_attendee_data.csv", headers)
    toast({
      title: "Download started",
      description: "Attendee data CSV download has started",
    })
  }

  const downloadParentData = () => {
    const headers = [
      "id",
      "created_at",
      "updated_at",
      "parent_name",
      "contact_number",
      "emergency_contact",
      "profiles.name",
      "profiles.email",
    ]
    downloadCSV(parentForms, "tillyhacks_parent_data.csv", headers)
    toast({
      title: "Download started",
      description: "Parent data CSV download has started",
    })
  }

  const downloadWaiverData = () => {
    const headers = [
      "id",
      "created_at",
      "updated_at",
      "waiver_agreement",
      "signature",
      "profiles.name",
      "profiles.email",
    ]
    downloadCSV(waiverForms, "tillyhacks_waiver_data.csv", headers)
    toast({
      title: "Download started",
      description: "Waiver data CSV download has started",
    })
  }

  const downloadAllData = () => {
    downloadAttendeeData()
    downloadParentData()
    downloadWaiverData()
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">

        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>admin auth</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuthenticate} className="space-y-4">
                <Input
                  type="password"
                  placeholder="enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "authenticating..." : "authenticate"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {dataLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p>loading form data...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-2xl font-bold">{attendeeForms.length}</h3>
                      <p className="text-muted-foreground">attendee forms</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-2xl font-bold">{parentForms.length}</h3>
                      <p className="text-muted-foreground">parent forms</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <h3 className="text-2xl font-bold">{waiverForms.length}</h3>
                      <p className="text-muted-foreground">waiver forms</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end mb-4 space-x-2">
                  <Button onClick={downloadAllData} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export All Data
                  </Button>
                </div>

                <Tabs defaultValue="attendee" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="attendee">attendee forms</TabsTrigger>
                    <TabsTrigger value="parent">parent forms</TabsTrigger>
                    <TabsTrigger value="waiver">waiver forms</TabsTrigger>
                  </TabsList>

                  <TabsContent value="attendee">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>attendee form submissions</CardTitle>
                        <Button onClick={downloadAttendeeData} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>submitted</TableHead>
                                <TableHead>user</TableHead>
                                <TableHead>attendee name</TableHead>
                                <TableHead>school</TableHead>
                                <TableHead>grade</TableHead>
                                <TableHead>experience</TableHead>
                                <TableHead>t-shirt</TableHead>
                                <TableHead>team pref</TableHead>
                                <TableHead>dietary restrictions</TableHead>
                                <TableHead>updated</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {attendeeForms.map((form) => (
                                <TableRow key={form.id}>
                                  <TableCell>{formatDate(form.created_at)}</TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{form.profiles.name}</div>
                                      <div className="text-sm text-muted-foreground">{form.profiles.email}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell>{form.attendee_name}</TableCell>
                                  <TableCell>{form.school || "N/A"}</TableCell>
                                  <TableCell>{form.grade_level || "N/A"}</TableCell>
                                  <TableCell>{form.programming_experience || "N/A"}</TableCell>
                                  <TableCell>{form.tshirt_size || "N/A"}</TableCell>
                                  <TableCell>{form.team_preference || "N/A"}</TableCell>
                                  <TableCell>{form.dietary_restrictions || "none"}</TableCell>
                                  <TableCell>
                                    {form.updated_at && form.updated_at !== form.created_at ? (
                                      <Badge variant="secondary">Updated</Badge>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="parent">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>parent form submissions</CardTitle>
                        <Button onClick={downloadParentData} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>submitted</TableHead>
                              <TableHead>user</TableHead>
                              <TableHead>parent name</TableHead>
                              <TableHead>contact</TableHead>
                              <TableHead>emergency contact</TableHead>
                              <TableHead>updated</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parentForms.map((form) => (
                              <TableRow key={form.id}>
                                <TableCell>{formatDate(form.created_at)}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{form.profiles.name}</div>
                                    <div className="text-sm text-muted-foreground">{form.profiles.email}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{form.parent_name}</TableCell>
                                <TableCell>{form.contact_number}</TableCell>
                                <TableCell>{form.emergency_contact}</TableCell>
                                <TableCell>
                                  {form.updated_at && form.updated_at !== form.created_at ? (
                                    <Badge variant="secondary">Updated</Badge>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="waiver">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>waiver form submissions</CardTitle>
                        <Button onClick={downloadWaiverData} variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export CSV
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>submitted</TableHead>
                              <TableHead>user</TableHead>
                              <TableHead>agreement</TableHead>
                              <TableHead>signature</TableHead>
                              <TableHead>updated</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {waiverForms.map((form) => (
                              <TableRow key={form.id}>
                                <TableCell>{formatDate(form.created_at)}</TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{form.profiles.name}</div>
                                    <div className="text-sm text-muted-foreground">{form.profiles.email}</div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={form.waiver_agreement ? "default" : "destructive"}>
                                    {form.waiver_agreement ? "agreed" : "disagreed"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{form.signature}</TableCell>
                                <TableCell>
                                  {form.updated_at && form.updated_at !== form.created_at ? (
                                    <Badge variant="secondary">Updated</Badge>
                                  ) : (
                                    "-"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
