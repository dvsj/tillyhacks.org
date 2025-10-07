"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

const faqItems = [
  {
    question: "What's a hackathon?",
    answer:
      "A hackathon is a fun, hands-on event where participants come together to build creative tech projects like apps, games, websites, etc. You learn, collaborate, and hopefully don't break anything important.",
  },
  {
    question: "Who can join?",
    answer: "Anyone interested in tech, coding, or building cool things! We welcome all experience levels, beginners included.",
  },
  {
    question: "Where is it?",
    answer: "We lowkey don't have a venue yet but check back later for more details.",
  },
  {
    question: "Do I need a team?",
    answer:
      "No, you can go solo or we'll help you find a team. Check the #find-a-team channel in the Discord if you need teammates.",
  },
  {
    question: "How do I sign up?",
    answer: "Log in and fill out the forms.",
  },
  {
    question: "Are there prizes?",
    answer:
      "Yep! We offer prizes (not yet decided what exactly the prizes will be) for categories like Best Beginner Hack, Most Creative Project, and more. However, the real prize is the friends you make along the way (and the free food).",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, headphones, water bottle, and whatever keeps you alive for 12 hours. We'll provide meals, snacks, Wi-Fi, powerstrips, etc.",
  },
  {
    question: "What if I have dietary restrictions?",
    answer: "Just let us know when you register. We'll make sure everyone has something to eat.",
  },
  {
    question: "Is it free?",
    answer:
      "Completely free. Food, swag, workshops, everything. We do accept donations though if you're feeling generous.",
  },
  {
    question: "Will there be adult supervision?",
    answer: "Yes. Staff and volunteers will be on-site and actively supervising for the entire 12-hour event. No unsupervised chaos allowed (we promise).",
  },
  {
    question: "Do parents need to stay?",
    answer: "Nope, drop and go. Just make sure someone picks you up unless you have permission from your guardian to leave on your own.",
  },
  {
    question: "How do I contact the organizers?",
    answer:
      "Email hello [at] tillyhacks [dot] org, or hit us up on Discord. For emergencies during the event, we will have a phone number posted.",
  },
]

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  const midpoint = Math.ceil(faqItems.length / 2)
  const leftColumn = faqItems.slice(0, midpoint)
  const rightColumn = faqItems.slice(midpoint)

  const renderFAQItem = (item: (typeof faqItems)[0], index: number, globalIndex: number) => (
    <Card
      key={index}
      className={`faq-item cursor-pointer transition-all hover:shadow-md ${openItem === globalIndex ? "open" : ""}`}
      onClick={() => toggleItem(globalIndex)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="font-bold">{item.question}</div>
          <ChevronDown className={`transition-transform ${openItem === globalIndex ? "rotate-180" : ""}`} size={20} />
        </div>
        <div className="answer text-muted-foreground text-sm">{item.answer}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">{leftColumn.map((item, index) => renderFAQItem(item, index, index))}</div>
      <div className="space-y-4">{rightColumn.map((item, index) => renderFAQItem(item, index, index + midpoint))}</div>
    </div>
  )
}