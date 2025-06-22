import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

export type MessagePattern = {
  input?: string
  output: string
  type: "text" | "image" | "video" | "quick_reply" | "buttons" | "carousel" | "flex"
  image_url?: string
  video_url?: string
  preview_image_url?: string
  sender_name?: string
  sender_icon_url?: string
  quick_replies?: string
  buttons?: string
}

// CSVからメッセージパターンを読み込む
export function loadMessagePatternsFromCSV(filePath: string): MessagePattern[] {
  try {
    // Vercelでの複数のパスを試行
    const possiblePaths = [
      path.resolve('./', filePath),
      path.resolve(process.cwd(), filePath),
      path.join(process.cwd(), filePath),
      path.join(__dirname, '..', filePath),
      path.join(process.cwd(), 'public', 'Responses.csv'),
      path.join(process.cwd(), 'public', filePath.split('/').pop() || ''),
      filePath
    ];
    
    let csvFile = '';
    let usedPath = '';
    
    for (const testPath of possiblePaths) {
      try {
        if (fs.existsSync(testPath)) {
          csvFile = fs.readFileSync(testPath, "utf-8");
          usedPath = testPath;
          console.log(`Successfully loaded CSV from: ${testPath}`);
          break;
        }
      } catch (err) {
        console.log(`Failed to read from ${testPath}:`, err.message);
      }
    }
    
    if (!csvFile) {
      console.error('CSV file not found in any of the attempted paths:', possiblePaths);
      throw new Error('CSV file not found');
    }
    const patterns = parse(csvFile, {
      columns: true,
      skip_empty_lines: false,
      quote: '"',
      escape: '"',
      relax_quotes: true,
      relax_column_count: true,
    }) as MessagePattern[]

    return patterns.map((pattern) => ({
      ...pattern,
      output: pattern.output ? pattern.output.replace(/\\n/g, "\n") : "",
      input: pattern.input || undefined,
      quick_replies: pattern.quick_replies || undefined,
      buttons: pattern.buttons || undefined,
      image_url: pattern.image_url || undefined,
      sender_name: pattern.sender_name || undefined,
      sender_icon_url: pattern.sender_icon_url || undefined,
    }))
  } catch (error) {
    console.error("Error loading message patterns:", error)
    return []
  }
}

// メッセージに一致するパターンを見つける
export function findMatchingPattern(message: string, patterns: MessagePattern[]): MessagePattern | null {
  const normalizedMessage = message.toLowerCase().trim()

  // 完全一致を探す
  const exactMatch = patterns.find((pattern) => pattern.input?.toLowerCase() === normalizedMessage)

  if (exactMatch) return exactMatch

  // 部分一致を探す
  const partialMatch = patterns.find((pattern) => normalizedMessage.includes(pattern.input?.toLowerCase() || ""))

  return partialMatch || null
}

// クイックリプライを生成
export function createQuickReply(options: string[]) {
  return {
    items: options.map((option) => ({
      type: "action" as const,
      action: {
        type: "message" as const,
        label: option,
        text: option,
      },
    })),
  }
}

// ボタンテンプレートを生成
export function createButtonTemplate(text: string, buttons: string[]) {
  return {
    type: "template" as const,
    altText: text,
    template: {
      type: "buttons" as const,
      text: text,
      actions: buttons.map((button) => ({
        type: "message" as const,
        label: button,
        text: button,
      })),
    },
  }
}

// カルーセルテンプレートを生成
export function createCarouselTemplate(items: string[]) {
  return {
    type: "template" as const,
    altText: "商品一覧",
    template: {
      type: "carousel" as const,
      columns: items.map((item) => ({
        thumbnailImageUrl: `https://example.com/${item.toLowerCase()}.jpg`,
        title: item,
        text: `${item}の詳細情報`,
        actions: [
          {
            type: "message" as const,
            label: "詳細を見る",
            text: `${item}の詳細`,
          },
          {
            type: "message" as const,
            label: "購入する",
            text: `${item}を購入`,
          },
        ],
      })),
    },
  }
}
