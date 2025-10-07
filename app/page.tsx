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
  const [displayText, setDisplayText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
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

  useEffect(() => {
    const baseText = userName ? `Hello ${userName}, welcome to ` : "welcome to "
    const fullText = baseText + "TillyHacks!"
    let currentIndex = 0
    setDisplayText("")
    setIsTyping(true)

    const typeText = () => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.slice(0, currentIndex + 1))
        currentIndex++
        setTimeout(typeText, 100)
      } else {
        setIsTyping(false)
      }
    }

    const timer = setTimeout(typeText, 500)
    return () => clearTimeout(timer)
  }, [userName])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" data-devs_secret_message="hey, what's up, hello. if you see this, email me at dev [at] tillyhacks [dot] org and say hi!">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <section className="py-12 md:py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className={displayText.includes("TillyHacks") ? "text-foreground" : ""}>
                {displayText.replace("TillyHacks!", "")}
              </span>
              {displayText.includes("TillyHacks") && <span className="text-primary">TillyHacks!</span>}
              {isTyping && <span className="animate-pulse">|</span>}
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">Northern Virginia • Sometime in September 2025</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/forms">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Register Now
                </Button>
              </Link>
              <Link href="#schedule">
                <Button size="lg" variant="outline">
                  View schedule
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="schedule" className="py-12">
          <h2 className="text-3xl font-bold mb-8">Schedule</h2>
          <Schedule />
        </section>

        <section id="faq" className="py-12">
          <h2 className="text-3xl font-bold mb-8">Faq</h2>
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
