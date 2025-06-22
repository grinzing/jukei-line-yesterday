import { type NextRequest, NextResponse } from "next/server"
import { Client, type WebhookEvent, type MessageEvent, type TextMessage } from "@line/bot-sdk"
import crypto from "crypto"
import {
  findMatchingPattern,
  loadMessagePatternsFromCSV,
  type MessagePattern,
  createQuickReply,
  createButtonTemplate,
  createCarouselTemplate,
} from "@/lib/message-patterns"

// LINE Bot configuration
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
  channelSecret: process.env.LINE_CHANNEL_SECRET!,
}

// Create LINE client
const client = new Client(config)

// Load message patterns
let messagePatterns: MessagePattern[] = []
let patternsLoadingPromise: Promise<void> | null = null

// Load patterns on startup
const loadPatterns = async () => {
  try {
    messagePatterns = loadMessagePatternsFromCSV("public/Responses.csv")
    console.log(`Loaded ${messagePatterns.length} message patterns from Responses.csv`)
    
    // デバッグ: 最初の数パターンとwelcomeパターンを確認
    console.log("First 3 patterns:", messagePatterns.slice(0, 3).map(p => ({
      input: p.input,
      type: p.type,
      outputPreview: p.output?.substring(0, 50) + "..."
    })))
    
    const welcomePattern = messagePatterns.find(p => p.input?.toLowerCase() === "welcome")
    console.log("Welcome pattern found:", !!welcomePattern)
    if (welcomePattern) {
      console.log("Welcome pattern details:", {
        input: welcomePattern.input,
        type: welcomePattern.type,
        hasOutput: !!welcomePattern.output,
        outputLength: welcomePattern.output?.length
      })
    }
  } catch (error) {
    console.error("Failed to load message patterns:", error)
    throw error // Propagate error to fail the promise
  }
}

// Ensure patterns are loaded before handling any request
const ensurePatternsLoaded = () => {
  if (!patternsLoadingPromise) {
    patternsLoadingPromise = loadPatterns()
  }
  return patternsLoadingPromise
}

// Verify LINE signature
function verifySignature(body: string, signature: string): boolean {
  const hash = crypto.createHmac("sha256", config.channelSecret).update(body).digest("base64")
  return hash === signature
}

async function sendMessagesForPattern(
  replyToken: string,
  matchedPatternIndex: number,
  userTextForDebug: string
): Promise<any> {
  const messagesToSend: any[] = []
  let currentIndex = matchedPatternIndex

  // Collect up to 5 messages for the reply, starting with the matched pattern
  // and continuing with subsequent patterns that have an empty input.
  while (currentIndex < messagePatterns.length && messagesToSend.length < 5) {
    const currentPattern = messagePatterns[currentIndex]

    // The first pattern must have a matching input.
    // Subsequent patterns must have an empty input to be part of the same sequence.
    if (currentIndex === matchedPatternIndex || !currentPattern.input) {
      let senderPayload = null
      if (currentPattern.sender_name && currentPattern.sender_icon_url) {
        senderPayload = {
          name: currentPattern.sender_name,
          iconUrl: currentPattern.sender_icon_url,
        }
      }

      let messageObject: any = {}

      switch (currentPattern.type) {
        case "text":
          messageObject = { type: "text", text: currentPattern.output }
          break
        case "image":
          // Send text output first if it exists
          if (currentPattern.output && currentPattern.output.trim() !== "") {
            const textFirstMessage: any = {
              type: "text",
              text: currentPattern.output.trim(),
            }
            if (senderPayload) {
              textFirstMessage.sender = senderPayload
            }
            messagesToSend.push(textFirstMessage)
          }

          if (currentPattern.image_url) {
            messageObject = {
              type: "image",
              originalContentUrl: currentPattern.image_url,
              previewImageUrl: currentPattern.image_url,
            }
          } else {
            console.warn("Image type pattern has no image_url:", currentPattern)
            currentIndex++
            if (
              currentIndex > matchedPatternIndex &&
              (currentIndex >= messagePatterns.length || messagePatterns[currentIndex].input)
            ) {
              break
            }
            continue
          }
          break
        case "video":
          // Send text output first if it exists
          if (currentPattern.output && currentPattern.output.trim() !== "") {
            const textFirstMessage: any = {
              type: "text",
              text: currentPattern.output.trim(),
            }
            if (senderPayload) {
              textFirstMessage.sender = senderPayload
            }
            messagesToSend.push(textFirstMessage)
          }

          if (currentPattern.video_url) {
            messageObject = {
              type: "video",
              originalContentUrl: currentPattern.video_url,
              previewImageUrl: currentPattern.preview_image_url || currentPattern.video_url,
            }
          } else {
            console.warn("Video type pattern has no video_url:", currentPattern)
            currentIndex++
            if (
              currentIndex > matchedPatternIndex &&
              (currentIndex >= messagePatterns.length || messagePatterns[currentIndex].input)
            ) {
              break
            }
            continue
          }
          break
        case "quick_reply": // This should now be handled by text messages with quick_replies
          messageObject = { type: "text", text: currentPattern.output }
          // Quick replies will be added later if this is the last message
          break
        case "buttons":
          if (currentPattern.buttons) {
            messageObject = createButtonTemplate(
              currentPattern.output,
              currentPattern.buttons.split("|")
            ) as any
          } else {
            console.warn("Buttons type pattern has no buttons:", currentPattern)
            currentIndex++
            if (
              currentIndex > matchedPatternIndex &&
              (currentIndex >= messagePatterns.length || messagePatterns[currentIndex].input)
            ) {
              break
            }
            continue
          }
          break
        case "carousel":
          if (currentPattern.buttons) {
            // Assuming buttons CSV column is used for carousel items
            messageObject = createCarouselTemplate(currentPattern.buttons.split("|")) as any
          } else {
            console.warn("Carousel type pattern has no buttons (items):", currentPattern)
            currentIndex++
            if (
              currentIndex > matchedPatternIndex &&
              (currentIndex >= messagePatterns.length || messagePatterns[currentIndex].input)
            ) {
              break
            }
            continue
          }
          break
        default:
          console.warn("Unknown message type in pattern:", currentPattern.type)
          currentIndex++
          if (
            currentIndex > matchedPatternIndex &&
            (currentIndex >= messagePatterns.length || messagePatterns[currentIndex].input)
          ) {
            break
          }
          continue // Skip unknown type
      }

      if (senderPayload) {
        messageObject.sender = senderPayload
      }

      // Add quick_replies to this specific message if defined
      if (messageObject.type === "text" && currentPattern.quick_replies) {
        messageObject.quickReply = createQuickReply(currentPattern.quick_replies.split("|"))
      }

      messagesToSend.push(messageObject)

      // If this is a continuation message, move to the next pattern
      if (currentIndex > matchedPatternIndex) {
        // Only break if the next pattern starts a new sequence or it's the end
        if (currentIndex + 1 >= messagePatterns.length || messagePatterns[currentIndex + 1].input) {
          break
        }
      }
      currentIndex++
    } else {
      // This pattern has an input and is not the first one, so it starts a new sequence.
      break
    }
  }

  // Quick replies are now added individually to each message pattern as needed

  if (messagesToSend.length > 0) {
    console.log("[DEBUG] Sending messages:", JSON.stringify(messagesToSend, null, 2))
    return client.replyMessage(replyToken, messagesToSend)
  } else {
    console.warn(
      "Pattern matched but no messages were generated for input:",
      userTextForDebug,
      "Pattern Index:",
      matchedPatternIndex
    )
  }
}

// Handle different types of messages
async function handleTextMessage(event: MessageEvent, message: TextMessage): Promise<any> {
  const { replyToken } = event
  const userText = message.text

  console.log("[DEBUG] Received user text:", userText)

  const matchedPatternIndex = messagePatterns.findIndex((p) => {
    if (!p.input) return false
    // Allow multiple variants separated by '|' in the CSV input column
    return p.input
      .split("|")
      .some((variant) => variant.toLowerCase().trim() === userText.toLowerCase().trim())
  })

  console.log("[DEBUG] Matched pattern index:", matchedPatternIndex)

  if (matchedPatternIndex !== -1) {
    return sendMessagesForPattern(replyToken, matchedPatternIndex, userText)
  }

  console.log("[DEBUG] No matching pattern found or no messages to send for:", userText)
  // Fallback reply if no pattern is matched or if pattern processing resulted in no messages
  return client.replyMessage(replyToken, {
    type: "text",
    text: "よくわからない。もう一度考え直して送ってくれ",
    sender: {
      name: "ハジメ",
      iconUrl: "https://jukei-images.web.app/hajime.jpeg",
    },
  })
}

// Handle webhook events
async function handleEvent(event: WebhookEvent): Promise<any> {
  console.log("Received event:", JSON.stringify(event, null, 2))

  switch (event.type) {
    case "message":
      if (event.message.type === "text") {
        return handleTextMessage(event, event.message)
      }
      break

    case "follow":
      console.log("Follow event received. Total patterns:", messagePatterns.length)
      const welcomePatternIndex = messagePatterns.findIndex(
        (p) => p.input?.toLowerCase() === "welcome"
      )
      console.log("Welcome pattern index found:", welcomePatternIndex)
      
      if (welcomePatternIndex !== -1) {
        console.log("Sending welcome pattern message...")
        // 「follow」イベントでも連続メッセージ送信ロジックを呼び出す
        return sendMessagesForPattern(event.replyToken, welcomePatternIndex, "follow_event")
      } else {
        console.error("Welcome pattern not found! Available patterns with input:")
        messagePatterns.forEach((p, i) => {
          if (p.input) {
            console.log(`  ${i}: ${p.input}`)
          }
        })
        // CSVが読み込めない場合のハードコーディングされたメッセージ（CSVファイルの内容と同期済み）
        console.log("Sending hardcoded welcome message due to CSV loading issue")
        return client.replyMessage(event.replyToken, {
          type: "text",
          text: "あナタは「呪いの画像」を見てしまいまシタ。\nアノ画像を見た人は発狂しマス。\n呪いヲ解くため二ハ、私ノ指示二従ってくだサイ。\nマズは、GiGO3号店へ向カイまショウ。\n\n行動指示☝\nGiGO3号館へ向カッテくだサイ。\nGiGO3号館へ着いたラ『さんごうかん』と入力シテくだサイ。",
          quickReply: createQuickReply(["さんごうかん"]),
        })
      }
      break

    case "unfollow":
      console.log(`User ${event.source.userId} has unfollowed.`)
      break

    default:
      console.log("Unhandled event type:", event.type)
  }

  return Promise.resolve(null)
}

// Webhook handler
export async function POST(req: NextRequest) {
  try {
    // Wait for patterns to be loaded before processing the request
    await ensurePatternsLoaded()
  } catch (error) {
    console.error("Aborting request due to pattern loading failure:", error)
    return new NextResponse("Internal Server Error: Could not load patterns", { status: 500 })
  }

  const signature = req.headers.get("x-line-signature")
  if (!signature) {
    console.error("Missing LINE signature")
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = await req.text()

  if (!verifySignature(body, signature)) {
    console.error("Invalid signature")
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const data = JSON.parse(body)
  const events: WebhookEvent[] = data.events || []

  const results = await Promise.allSettled(events.map((event) => handleEvent(event)))

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Event ${index} failed:`, result.reason)
    }
  })

  return new NextResponse("OK", { status: 200 })
}

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    patternsLoaded: messagePatterns.length,
  })
}
