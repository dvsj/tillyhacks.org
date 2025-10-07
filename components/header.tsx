"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/components/supabase-provider"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const [userName, setUserName] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        const { data: profileData } = await supabase.from("profiles").select("name").eq("id", userData.user.id).single()

        if (profileData) {
          setUserName(profileData.name)
        } else {
          setUserName(userData.user.user_metadata?.name || null)
        }
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUserName(null)
    toast({
      title: "logged out",
      description: "see ya later",
    })
    router.push("/")
    router.refresh()
  }

  if (!isClient) {
    return null
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="TillyHacks Logo" className="h-8 w-8" />
          <span className="text-2xl md:text-3xl font-bold">
            <span className="text-primary">Tilly</span>Hacks
          </span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {userName && <p className="text-sm text-muted-foreground">hey {userName}!</p>}
          <div className="flex items-center space-x-4">
            <Link href="/instagram" className="text-foreground hover:text-primary transition-colors" title="instagram">
              <i className="fab fa-instagram text-xl"></i>
            </Link>
            <Link href="/discord" className="text-foreground hover:text-primary transition-colors" title="discord">
              <i className="fab fa-discord text-xl"></i>
            </Link>
            <Link href="/donate" className="text-foreground hover:text-primary transition-colors" title="donate">
              <i className="fas fa-donate text-xl"></i>
            </Link>
            {/*
              <Link href="/forms" className="text-foreground hover:text-primary transition-colors" title="forms">
                <i className="fas fa-file-alt text-xl"></i>
              </Link>
              {userName ? (
                <Button variant="ghost" onClick={handleLogout} title="logout">
                  <i className="fas fa-sign-out-alt text-xl"></i>
                </Button>
              ) : (
                <Link href="/login" title="login">
                  <Button variant="ghost">
                    <i className="fas fa-sign-in-alt text-xl"></i>
                  </Button>
                </Link>
              )}
              // Login, register, and forms links are hidden for interest-only phase. will restore when registration opens.
            */}
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <i className="fas fa-bars"></i>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <div className="flex flex-col space-y-4 mt-8">
              {userName && <p className="text-sm text-muted-foreground mb-4">hey {userName}!</p>}
              <Link href="/" className="py-2 hover:text-primary transition-colors">
                <i className="fas fa-home mr-2"></i>home
              </Link>
              {/*
                <Link href="/forms" className="py-2 hover:text-primary transition-colors">
                  <i className="fas fa-file-alt mr-2"></i>forms
                </Link>
                // Forms link hidden for interest-only phase.
              */}
              <Link href="/instagram" className="py-2 hover:text-primary transition-colors">
                <i className="fab fa-instagram mr-2"></i>instagram
              </Link>
              <Link href="/discord" className="py-2 hover:text-primary transition-colors">
                <i className="fab fa-discord mr-2"></i>discord
              </Link>
              <Link href="/donate" className="py-2 hover:text-primary transition-colors">
                <i className="fas fa-donate mr-2"></i>donate
              </Link>
              {/*
                {userName ? (
                  <Button variant="outline" onClick={handleLogout} className="mt-4">
                    <i className="fas fa-sign-out-alt mr-2"></i>logout
                  </Button>
                ) : (
                  <Link href="/login">
                    <Button className="w-full mt-4">
                      <i className="fas fa-sign-in-alt mr-2"></i>login
                    </Button>
                  </Link>
                )}
                // Login/logout hidden for interest-only phase.
              */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}