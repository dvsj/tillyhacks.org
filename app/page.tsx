"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Schedule from "@/components/schedule"
import FAQ from "@/components/faq"
import Sponsors from "@/components/sponsors"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSupabase } from "@/components/supabase-provider"

export default function Home() {
  const [userName, setUserName] = useState<string | null>(null)
  const { supabase } = useSupabase()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          // Get user profile data
          const { data: profileData } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", userData.user.id)
            .single()

          if (profileData) {
            setUserName(profileData.name)
          } else {
            setUserName(userData.user.user_metadata?.name || null)
          }
        }
      }
    }

    checkUser()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="py-12 md:py-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-typing overflow-hidden whitespace-nowrap border-r-4 border-primary w-[300px] md:w-[600px]">
            {userName ? `Welcome to TillyHacks, ${userName}!` : "Welcome to TillyHacks!"}
          </h1>
          <p className="text-xl mb-8">Northern Virginia • 09-xx-25 - 09-xx-25</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/forms">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Register Now
              </Button>
            </Link>
            <Link href="#schedule">
              <Button size="lg" variant="outline">
                View Schedule
              </Button>
            </Link>
          </div>
        </section>

        <section id="schedule" className="py-12">
          <h2 className="text-3xl font-bold mb-8">Schedule</h2>
          <Schedule />
        </section>

        <section id="faq" className="py-12">
          <h2 className="text-3xl font-bold mb-8">FAQ</h2>
          <FAQ />
        </section>

        <section id="sponsors" className="py-12">
          <h2 className="text-3xl font-bold mb-8">Sponsors</h2>
          <Sponsors />
        </section>
      </main>
      <Footer />
    </div>
  )
}
