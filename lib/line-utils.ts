import { Client } from "@line/bot-sdk"

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
})

export { client }

// Helper function to send push messages
export async function sendPushMessage(userId: string, message: string) {
  try {
    await client.pushMessage(userId, {
      type: "text",
      text: message,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to send push message:", error)
    return { success: false, error }
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const profile = await client.getProfile(userId)
    return { success: true, profile }
  } catch (error) {
    console.error("Failed to get user profile:", error)
    return { success: false, error }
  }
}
