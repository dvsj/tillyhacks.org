import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, action, data } = body

    // Discord webhook URL - you'll need to set this in your environment variables
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
          color: 0x7c3aed, // Purple color
          timestamp: new Date().toISOString(),
          footer: {
            text: "TillyHacks Registration System",
          },
        },
      ],
    }

    // Customize message based on form type
    switch (type) {
      case "new_user":
        message.embeds[0].title = `🎉 New User Registered!`
        message.embeds[0].description = `**Name:** ${data.name}\n**Email:** ${data.email}\n**Method:** ${data.method}`
        message.embeds[0].color = 0x22c55e // Green for new users
        break
      case "attendee_form":
        message.embeds[0].title = `🎉 Attendee Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `**Name:** ${data.name}\n**School:** ${data.school}\n**Experience:** ${data.experience}`
        message.embeds[0].color = action === "updated" ? 0xf59e0b : 0x10b981 // Orange for update, green for new
        break
      case "parent_form":
        message.embeds[0].title = `👨‍👩‍👧‍👦 Parent Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `**Parent:** ${data.parent_name}\n**Contact:** ${data.contact_number}`
        message.embeds[0].color = action === "updated" ? 0xf59e0b : 0x3b82f6 // Orange for update, blue for new
        break
      case "waiver_form":
        message.embeds[0].title = `📝 Waiver Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `**Signature:** ${data.signature}\n**Agreement:** ${data.waiver_agreement ? "Agreed" : "Disagreed"}`
        message.embeds[0].color = action === "updated" ? 0xf59e0b : 0xef4444 // Orange for update, red for new
        break
      default:
        message.embeds[0].title = `📋 Form ${action === "updated" ? "Updated" : "Submitted"}!`
        message.embeds[0].description = `A ${type} has been ${action}.`
    }

    // Send to Discord
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
