"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown } from "lucide-react"

const faqItems = [
  {
    question: "What is a hackathon?",
    answer:
      "A hackathon is a fun, hands-on event where participants come together to build creative tech projects, like apps, games, websites, or even hardware. It's all about learning new skills, collaborating, and bringing your ideas to life.",
  },
  {
    question: "Who can participate?",
    answer:
      "Anyone interested in tech, coding, or building cool things! We welcome all experience levels — beginners included.",
  },
  {
    question: "Where is it held?",
    answer:
      "The event takes place at <venue here>, a secure location with limited access. Only registered attendees, approved staff, and authorized adults may enter the event area.",
  },
  {
    question: "Are there teams?",
    answer:
      "Yes! You can bring friends and team up with them. If you don't have a team, don't worry! We'll help you find one at the event, or you can find one in the #find-a-team channel of the Discord.",
  },
  {
    question: "How do I sign up?",
    answer: "Log in to our website and fill out the required forms in your dashboard.",
  },
  {
    question: "Are there prizes?",
    answer:
      "Yes! We offer prizes (not yet decided what exactly the prizes will be) for categories like Best Beginner Hack, Most Creative Project, and more. However, we believe that the best reward is the experience and what you build.",
  },
  {
    question: "What should I bring?",
    answer:
      "Bring your laptop, charger, headphones, a water bottle, and anything else you personally need for the day (meds, comfort items, etc.). We'll provide meals, snacks, Wi-Fi, power strips, and more!",
  },
  {
    question: "What if I have dietary restrictions?",
    answer:
      "No problem! Just let us know during registration — we'll make sure everyone has food options that work for them.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes! Registration, food, swag, workshops, and all activities are completely free for all participants. However, we do accept donations to help cover costs and support future events.",
  },
  {
    question: "Will there be adult supervision?",
    answer:
      "Yes. Staff and volunteers will be on-site and actively supervising for the entire 12-hour event. Students are never left unsupervised.",
  },
  {
    question: "Do parents need to stay?",
    answer:
      "No — parents are not required to stay. They're welcome to attend check-in. Students must be checked in and out by a guardian unless a signed waiver allows them to leave independently.",
  },
  {
    question: "How can I contact the organizers?",
    answer:
      "You can reach us anytime at hello@tillyhacks.org or message us on Discord. For urgent questions during the event, call or text us at xxx-xxx-xxxx.",
  },
]

export default function FAQ() {
  const [openItem, setOpenItem] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index)
  }

  // Split the FAQ items into two columns
  const midpoint = Math.ceil(faqItems.length / 2)
  const leftColumn = faqItems.slice(0, midpoint)
  const rightColumn = faqItems.slice(midpoint)

  const renderFAQItem = (item: (typeof faqItems)[0], index: number, globalIndex: number) => (
    <Card
      key={index}
      className={`faq-item cursor-pointer ${openItem === globalIndex ? "open" : ""}`}
      onClick={() => toggleItem(globalIndex)}
    >
      <CardContent className="p-4 flex flex-col">
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
