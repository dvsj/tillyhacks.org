"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RegisterForm } from "@/components/register-form"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <Card className="w-[450px] shadow-md">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center justify-center space-x-2">
              <img src="/logo.png" alt="TillyHacks Logo" className="h-12 w-12" />
              <h1 className="text-4xl font-bold">
                <span className="text-primary">Tilly</span>Hacks
              </h1>
            </div>
          </Link>
          <CardTitle className="text-2xl">register</CardTitle>
          <CardDescription>create an account to register for the hackathon</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
