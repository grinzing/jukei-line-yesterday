"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function CSVDownloadPage() {
  const [csvContent, setCsvContent] =
    useState(`input,output,type,image_url,sender_name,sender_icon_url,quick_replies,buttons
こんにちは,こんにちは！何かお手伝いできることはありますか？,text,,,,,
おはよう,おはようございます！今日も素晴らしい一日になりますように。,text,https://example.com/morning.jpg,おはようBot,https://example.com/morning-icon.jpg,,
天気,今日の天気をお調べします,quick_reply,,,,今日の天気|明日の天気|週間天気,
メニュー,どちらをお選びになりますか？,buttons,,,,,サービス案内|料金プラン|お問い合わせ
商品案内,おすすめ商品をご紹介します,carousel,,,,,商品A|商品B|商品C
ニュース,最新ニュースです,text,https://example.com/news.jpg,ニュースBot,https://example.com/news-icon.jpg,,
ありがとう,どういたしまして！他にお手伝いできることがあればお知らせください。,text,,,,,
さようなら,さようなら！またのご利用をお待ちしております。,text,,,,,
help,以下のコマンドが利用可能です：\n・こんにちは - 挨拶\n・天気 - 天気情報\n・メニュー - サービスメニュー\n・help - このヘルプメッセージ,text,,,,,`)

  const downloadCSV = () => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "responses.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(csvContent)
    alert("CSVデータがクリップボードにコピーされました！")
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">CSV データダウンロード</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CSV列の説明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">基本列</h4>
              <ul className="space-y-1">
                <li>
                  <strong>0. input:</strong> ユーザーの入力パターン
                </li>
                <li>
                  <strong>1. output:</strong> ボットの応答メッセージ
                </li>
                <li>
                  <strong>2. type:</strong> メッセージタイプ
                </li>
                <li>
                  <strong>3. image_url:</strong> 画像URL（オプション）
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">拡張列</h4>
              <ul className="space-y-1">
                <li>
                  <strong>4. sender_name:</strong> 送信者名（オプション）
                </li>
                <li>
                  <strong>5. sender_icon_url:</strong> 送信者アイコンURL（オプション）
                </li>
                <li>
                  <strong>6. quick_replies:</strong> クイックリプライ選択肢（|区切り）
                </li>
                <li>
                  <strong>7. buttons:</strong> ボタン選択肢（|区切り）
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>メッセージタイプ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-1">
                <li>
                  <strong>text:</strong> 通常のテキストメッセージ
                </li>
                <li>
                  <strong>quick_reply:</strong> クイックリプライ付きメッセージ
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-1">
                <li>
                  <strong>buttons:</strong> ボタンテンプレート
                </li>
                <li>
                  <strong>carousel:</strong> カルーセル（商品一覧など）
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSVデータ</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="CSVデータを編集してください..."
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={downloadCSV}>CSVファイルをダウンロード</Button>
            <Button variant="outline" onClick={copyToClipboard}>
              クリップボードにコピー
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold">1. 基本的なテキスト応答</h4>
              <code className="bg-gray-100 p-2 rounded block">こんにちは,こんにちは！,text,,,,,</code>
            </div>
            <div>
              <h4 className="font-semibold">2. 画像付きメッセージ</h4>
              <code className="bg-gray-100 p-2 rounded block">
                おはよう,おはようございます！,text,https://example.com/morning.jpg,おはようBot,,,
              </code>
            </div>
            <div>
              <h4 className="font-semibold">3. クイックリプライ</h4>
              <code className="bg-gray-100 p-2 rounded block">
                天気,天気をお調べします,quick_reply,,,,今日の天気|明日の天気|週間天気,
              </code>
            </div>
            <div>
              <h4 className="font-semibold">4. ボタンテンプレート</h4>
              <code className="bg-gray-100 p-2 rounded block">
                メニュー,お選びください,buttons,,,,,サービス案内|料金プラン|お問い合わせ
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
