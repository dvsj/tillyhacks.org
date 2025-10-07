"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"

export default function AttendeeForm() {
  const [formData, setFormData] = useState({
    attendeeName: "",
    school: "",
    gradeLevel: "",
    programmingExperience: "",
    preferredLanguages: [] as string[],
    tshirtSize: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    howDidYouHear: "",
    whatToLearn: "",
    teamPreference: "",
    dietaryRestrictions: "",
  })
  const [existingForm, setExistingForm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()

  const programmingLanguages = [
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "HTML/CSS",
    "React",
    "Node.js",
    "Swift",
    "Kotlin",
    "Go",
    "Rust",
    "Other",
  ]

  useEffect(() => {
    const checkAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to access this form.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        setCurrentUser(userData.user)
        await loadExistingForm(userData.user.id)
      }
    }

    checkAuth()
  }, [])

  const loadExistingForm = async (userId: string) => {
    try {
      const { data: existingData, error } = await supabase
        .from("attendee_forms")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading form:", error)
        return
      }

      if (existingData) {
        setExistingForm(existingData)
        setFormData({
          attendeeName: existingData.attendee_name || "",
          school: existingData.school || "",
          gradeLevel: existingData.grade_level || "",
          programmingExperience: existingData.programming_experience || "",
          preferredLanguages: existingData.preferred_languages || [],
          tshirtSize: existingData.tshirt_size || "",
          emergencyContactName: existingData.emergency_contact_name || "",
          emergencyContactPhone: existingData.emergency_contact_phone || "",
          howDidYouHear: existingData.how_did_you_hear || "",
          whatToLearn: existingData.what_to_learn || "",
          teamPreference: existingData.team_preference || "",
          dietaryRestrictions: existingData.dietary_restrictions || "",
        })
      }
    } catch (error) {
      console.error("Error loading existing form:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferredLanguages: checked
        ? [...prev.preferredLanguages, language]
        : prev.preferredLanguages.filter((l) => l !== language),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!currentUser) {
        throw new Error("User not authenticated")
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", currentUser.id)
        .maybeSingle()

      if (profileError && profileError.code !== "PGRST116") {
        throw new Error("Error checking user profile")
      }

      if (!profileData) {
        const { error: createProfileError } = await supabase.from("profiles").insert({
          id: currentUser.id,
          email: currentUser.email || "",
          name: currentUser.user_metadata?.full_name || currentUser.email || "",
        })

        if (createProfileError) {
          throw new Error("Error creating user profile")
        }
      }

      const formPayload = {
        user_id: currentUser.id,
        attendee_name: formData.attendeeName,
        school: formData.school,
        grade_level: formData.gradeLevel,
        programming_experience: formData.programmingExperience,
        preferred_languages: formData.preferredLanguages,
        tshirt_size: formData.tshirtSize,
        emergency_contact_name: formData.emergencyContactName,
        emergency_contact_phone: formData.emergencyContactPhone,
        how_did_you_hear: formData.howDidYouHear,
        what_to_learn: formData.whatToLearn,
        team_preference: formData.teamPreference,
        dietary_restrictions: formData.dietaryRestrictions,
      }

      let result
      if (existingForm) {
        result = await supabase
          .from("attendee_forms")
          .update(formPayload)
          .eq("user_id", currentUser.id)
          .eq("id", existingForm.id)
      } else {
        result = await supabase.from("attendee_forms").insert([formPayload])
      }

      if (result.error) {
        throw result.error
      }

      try {
        await fetch("/api/discord-webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "attendee_form",
            action: existingForm ? "updated" : "submitted",
            data: {
              name: formData.attendeeName,
              school: formData.school,
              experience: formData.programmingExperience,
            },
          }),
        })
      } catch (webhookError) {
        console.error("Discord webhook error:", webhookError)
      }

      toast({
        title: existingForm ? "Form updated" : "Form submitted",
        description: `Attendee form has been ${existingForm ? "updated" : "submitted"} successfully.`,
      })

      router.push("/forms")
    } catch (error: any) {
      console.error("Form submission error:", error)
      toast({
        title: "Submission failed",
        description: error.message || "An error occurred while submitting the form.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
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
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{existingForm ? "Edit Attendee Form" : "Attendee Form"}</CardTitle>
            <CardDescription>
              {existingForm
                ? "Update your attendee information"
                : "Please provide attendee information and preferences"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="attendee-name">Full Name *</Label>
                <Input
                  id="attendee-name"
                  value={formData.attendeeName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, attendeeName: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="school">School *</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                    placeholder="Your school name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade-level">Grade Level *</Label>
                  <Select
                    value={formData.gradeLevel}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, gradeLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9th">9th Grade</SelectItem>
                      <SelectItem value="10th">10th Grade</SelectItem>
                      <SelectItem value="11th">11th Grade</SelectItem>
                      <SelectItem value="12th">12th Grade</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Programming Experience *</Label>
                <RadioGroup
                  value={formData.programmingExperience}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, programmingExperience: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">Beginner (little to no experience)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Intermediate (some projects/coursework)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Advanced (extensive experience)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Preferred Programming Languages (select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {programmingLanguages.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={formData.preferredLanguages.includes(language)}
                        onCheckedChange={(checked) => handleLanguageChange(language, checked as boolean)}
                      />
                      <Label htmlFor={language} className="text-sm">
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tshirt-size">T-Shirt Size *</Label>
                <Select
                  value={formData.tshirtSize}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, tshirtSize: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XS">XS</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-contact-name">Emergency Contact Name *</Label>
                  <Input
                    id="emergency-contact-name"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactName: e.target.value }))}
                    placeholder="Emergency contact name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency-contact-phone">Emergency Contact Phone *</Label>
                  <Input
                    id="emergency-contact-phone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, emergencyContactPhone: e.target.value }))}
                    placeholder="Emergency contact phone"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="how-did-you-hear">How did you hear about TillyHacks? *</Label>
                <Select
                  value={formData.howDidYouHear}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, howDidYouHear: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social-media">Social Media</SelectItem>
                    <SelectItem value="friend">Friend/Word of mouth</SelectItem>
                    <SelectItem value="teacher">Teacher/School</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="previous-event">Previous TillyHacks event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="what-to-learn">What do you want to learn or build?</Label>
                <Textarea
                  id="what-to-learn"
                  value={formData.whatToLearn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, whatToLearn: e.target.value }))}
                  placeholder="Tell us about your goals for the hackathon"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Preference *</Label>
                <RadioGroup
                  value={formData.teamPreference}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, teamPreference: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="solo" id="solo" />
                    <Label htmlFor="solo">I want to work solo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="need-team" id="need-team" />
                    <Label htmlFor="need-team">I need to find a team</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="have-team" id="have-team" />
                    <Label htmlFor="have-team">I already have a team</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary-restrictions">Dietary Restrictions</Label>
                <Textarea
                  id="dietary-restrictions"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dietaryRestrictions: e.target.value }))}
                  placeholder="Enter any dietary restrictions or preferences (optional)"
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Submitting..." : existingForm ? "Update Form" : "Submit Form"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/forms")} disabled={isLoading}>
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
