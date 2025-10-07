import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

        if (!existingProfile) {
          await supabase.from("profiles").insert({
            id: user.id,
            name: user.user_metadata.name || user.user_metadata.preferred_username || "GitHub User",
            email: user.email || "",
          })
        }
      }
    } catch (error) {
      console.error("Error in auth callback:", error)
    }
  }

  const origin = requestUrl.origin.includes("localhost") ? requestUrl.origin : "https://tillyhacks.org"

  return NextResponse.redirect(`${origin}/`)
}
