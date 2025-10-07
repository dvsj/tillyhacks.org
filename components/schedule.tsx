"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

const scheduleItems = [
  {
    time: "8:00 AM",
    title: "Check-in & Breakfast",
    details: "Show up, grab some food, try to wake up. Coffee will be available (you'll need it).",
  },
  {
    time: "9:00 AM",
    title: "Opening Ceremony",
    details: "Welcome speech, rules, and trying to get everyone hyped. Probably some bad jokes too.",
  },
  {
    time: "10:00 AM",
    title: "Hacking Begins",
    details: "Dive into your projects! Form teams, brainstorm ideas, start coding.",
  },
  {
    time: "1:00 PM",
    title: "Lunch Break",
    details: "Fuel up and network. Or just eat in silence while debugging, we don't judge.",
  },
  {
    time: "3:00 PM",
    title: "Workshops",
    details: "Learn new skills from people who actually know what they're doing (unlike us).",
  },
  {
    time: "6:00 PM",
    title: "Dinner",
    details: "More food to keep you going. This is when the real grind starts.",
  },
  {
    time: "8:00 PM",
    title: "Networking Session",
    details: "Meet other hackers, mentors, and sponsors. Make connections or just complain about bugs together.",
  },
  {
    time: "10:00 PM",
    title: "Wrap Up",
    details: "Finish your projects, prepare demos, and pray everything still works. Presentation time approaches.",
  },
]

export default function Schedule() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  return (
    <div className="grid gap-4">
      {scheduleItems.map((item, index) => (
        <Card
          key={index}
          className={`schedule-item cursor-pointer transition-all hover:shadow-md ${openItem === index ? "open" : ""}`}
          onClick={() => toggleItem(index)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{item.time}</span> - {item.title}
              </div>
              <ChevronDown className={`transition-transform ${openItem === index ? "rotate-180" : ""}`} size={20} />
            </div>
            <div className="details text-muted-foreground text-sm">{item.details}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}