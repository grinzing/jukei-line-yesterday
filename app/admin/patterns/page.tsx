"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Pattern = {
  input: string
  output: string
  type: string
  image_url?: string
  sender_name?: string
  sender_icon_url?: string
  quick_replies?: string
  buttons?: string
}

export default function PatternsPage() {
  const [patterns, setPatterns] = useState<Pattern[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const samplePatterns: Pattern[] = [
      {
        input: "こんにちは",
        output: "こんにちは！何かお手伝いできることはありますか？",
        type: "text",
      },
      {
        input: "おはよう",
        output: "おはようございます！今日も素晴らしい一日になりますように。",
        type: "text",
        image_url: "https://example.com/morning.jpg",
        sender_name: "おはようBot",
      },
      {
        input: "天気",
        output: "今日の天気をお調べします",
        type: "quick_reply",
        quick_replies: "今日の天気|明日の天気|週間天気",
      },
      {
        input: "メニュー",
        output: "どちらをお選びになりますか？",
        type: "buttons",
        buttons: "サービス案内|料金プラン|お問い合わせ",
      },
      {
        input: "商品案内",
        output: "おすすめ商品をご紹介します",
        type: "carousel",
        buttons: "商品A|商品B|商品C",
      },
    ]

    setPatterns(samplePatterns)
    setLoading(false)
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case "text":
        return "default"
      case "quick_reply":
        return "secondary"
      case "buttons":
        return "outline"
      case "carousel":
        return "destructive"
      default:
        return "default"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">応答パターン管理</h1>

      <Card>
        <CardHeader>
          <CardTitle>登録済み応答パターン</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>読み込み中...</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>入力パターン</TableHead>
                    <TableHead>応答メッセージ</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead>画像</TableHead>
                    <TableHead>送信者名</TableHead>
                    <TableHead>選択肢</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patterns.map((pattern, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{pattern.input}</TableCell>
                      <TableCell className="max-w-xs truncate">{pattern.output}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeColor(pattern.type) as any}>{pattern.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {pattern.image_url ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{pattern.sender_name || "-"}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {pattern.quick_replies || pattern.buttons || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 space-x-2">
            <Button>新規パターン追加</Button>
            <Button variant="outline">CSVエクスポート</Button>
            <Button variant="outline">CSVインポート</Button>
            <Button variant="outline">プレビュー</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>CSVフォーマット例</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {`input,output,type,image_url,sender_name,sender_icon_url,quick_replies,buttons
こんにちは,こんにちは！,text,,,,,
天気,天気をお調べします,quick_reply,,,,今日|明日|週間,
メニュー,お選びください,buttons,,,,,案内|料金|問合せ`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
