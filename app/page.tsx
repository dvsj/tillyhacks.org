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
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, name")
            .eq("id", userData.user.id)
            .single()

          if (profileData) {
            setUserName(profileData.first_name || profileData.name?.split(" ")[0] || null)
          } else {
            const githubName = userData.user.user_metadata?.name
            setUserName(githubName ? githubName.split(" ")[0] : null)
          }
        }
      }
    }

    checkUser()
  }, [supabase])


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-devs_secret_message="hey, what's up, hello. if you see this, email me at dev [at] tillyhacks [dot] org and say hi!">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {userName ? `Hello ${userName}, welcome to ` : "welcome to "}
              <span className="text-primary">Tilly</span>Hacks!
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">Northern Virginia • Coming soon in Winter 2025</p>
            <div className="flex flex-col gap-4 justify-center">
              {/* Interest form replaces registration for now */}
              <a href="https://docs.google.com/forms/d/1xWWsD1IJcsTjh35Y3605zMQZIbX_LEDWtO_iSD4RTt8/viewform" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Express Interest
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Schedule removed for interest-only phase. will restore later when event details are finalized. */}

        {/*
          <section id="faq" className="py-12">
            <h2 className="text-3xl font-bold mb-8">FAQ</h2>
            <FAQ />
          </section>
          // FAQ section hidden for interest-only phase. 
        */}

        <section id="sponsors" className="py-12">
          <h2 className="text-3xl font-bold mb-8">Sponsors</h2>
          <Sponsors />
        </section>
      </main>
      <Footer />
    </div>
  )
}
