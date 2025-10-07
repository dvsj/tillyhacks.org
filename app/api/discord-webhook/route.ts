import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, data } = body

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL

    if (!webhookUrl) {
      console.error("Discord webhook URL not configured")
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    const message = {
      content: null,
      embeds: [
        {
          title: "",
          description: "",
          timestamp: new Date().toISOString(),
          footer: {
            text: "TillyHacks Registration System",
          },
        },
      ],
    }

    switch (type) {
      case "new_user":
        message.embeds[0].title = `🎉 New User Registered!`
        message.embeds[0].description = `**Name:** ${data.name}\n**Email:** ${data.email}\n**Method:** ${data.method}`
        break
      case "attendee_form":
        message.embeds[0].title = `🎉 Attendee Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `**Name:** ${data.name}\n**School:** ${data.school}\n**Experience:** ${data.experience}`
        break
      case "parent_form":
        message.embeds[0].title = `👨‍👩‍👧‍👦 Parent Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `**Parent:** ${data.parent_name}\n**Contact:** ${data.contact_number}`
        break
      case "waiver_form":
        message.embeds[0].title = `📝 Waiver Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `**Signature:** ${data.signature}\n**Agreement:** ${data.waiver_agreement ? "Agreed" : "Disagreed"}`
        break
      default:
        message.embeds[0].title = `📋 Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `A ${type} has been ${action}.`
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Discord webhook error:", error)
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 })
  }
}
