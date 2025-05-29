"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Header from "@/components/header"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"

export default function WaiverForm() {
  const [waiverAgreement, setWaiverAgreement] = useState<string>("")
  const [signature, setSignature] = useState("")
  const [existingForm, setExistingForm] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const { supabase } = useSupabase()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to access this form.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      await loadExistingForm()
    }

    checkAuth()
  }, [])

  const loadExistingForm = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: existingData, error } = await supabase
        .from("waiver_forms")
        .select("*")
        .eq("user_id", userData.user.id)
        .maybeSingle()

      if (error) {
        console.error("Error loading form:", error)
        return
      }

      if (existingData) {
        setExistingForm(existingData)
        setWaiverAgreement(existingData.waiver_agreement ? "agree" : "disagree")
        setSignature(existingData.signature || "")
      }
    } catch (error) {
      console.error("Error loading existing form:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (waiverAgreement !== "agree") {
        toast({
          title: "Agreement required",
          description: "You must agree to the waiver terms to continue.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("User not authenticated")
      }

      const formPayload = {
        waiver_agreement: waiverAgreement === "agree",
        signature,
        user_id: userData.user.id,
      }

      // Use upsert instead of separate update/insert logic
      const { error } = await supabase.from("waiver_forms").upsert(formPayload, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })

      if (error) {
        throw error
      }

      // Send Discord webhook notification
      try {
        await fetch("/api/discord-webhook", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "waiver_form",
            action: existingForm ? "updated" : "submitted",
            data: {
              signature: signature,
              waiver_agreement: waiverAgreement === "agree",
            },
          }),
        })
      } catch (webhookError) {
        console.error("Discord webhook error:", webhookError)
      }

      toast({
        title: existingForm ? "Form updated" : "Form submitted",
        description: `Waiver form has been ${existingForm ? "updated" : "submitted"} successfully.`,
      })

      router.push("/forms")
    } catch (error: any) {
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
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{existingForm ? "Edit Waiver Form" : "Waiver Form"}</CardTitle>
            <CardDescription>
              {existingForm ? "Update waiver agreement" : "Please read and agree to the waiver terms"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted rounded-md text-sm">
              <p className="mb-4">
                By agreeing to this waiver, I acknowledge that participation in TillyHacks involves certain risks. I
                voluntarily assume all risks associated with my participation and release the organizers from any
                liability.
              </p>
              <p>
                I also grant permission for photographs and recordings taken during the event to be used for promotional
                purposes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Do you agree to the waiver terms?</Label>
                <RadioGroup
                  value={waiverAgreement}
                  onValueChange={setWaiverAgreement}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="agree" id="agree" />
                    <Label htmlFor="agree">I Agree</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="disagree" id="disagree" />
                    <Label htmlFor="disagree">I Disagree</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature">Signature (Full Name)</Label>
                <Input
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Type your full name as signature"
                  required
                  disabled={isLoading}
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
