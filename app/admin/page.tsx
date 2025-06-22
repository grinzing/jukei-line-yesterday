"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminDashboard() {
  const [status, setStatus] = useState<string>("checking...")
  const [lastCheck, setLastCheck] = useState<string>("")

  const checkWebhookHealth = async () => {
    try {
      const response = await fetch("/api/webhook")
      const data = await response.json()
      setStatus(response.ok ? "healthy" : "error")
      setLastCheck(new Date().toLocaleString())
    } catch (error) {
      setStatus("error")
      setLastCheck(new Date().toLocaleString())
    }
  }

  useEffect(() => {
    checkWebhookHealth()
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">LINE Bot Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Webhook Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-3 h-3 rounded-full ${
                  status === "healthy" ? "bg-green-500" : status === "error" ? "bg-red-500" : "bg-yellow-500"
                }`}
              />
              <span className="capitalize">{status}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">Last checked: {lastCheck || "Never"}</p>
            <Button onClick={checkWebhookHealth} size="sm">
              Check Status
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bot Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <strong>Webhook URL:</strong> /api/webhook
              </p>
              <p>
                <strong>Environment:</strong> {process.env.NODE_ENV}
              </p>
              <p>
                <strong>Features:</strong>
              </p>
              <ul className="list-disc list-inside text-sm ml-4">
                <li>Text message handling</li>
                <li>Command processing</li>
                <li>Follow/Unfollow events</li>
                <li>Signature verification</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>応答パターン管理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">登録済みの応答パターンを確認・編集できます</p>
            <Link href="/admin/patterns">
              <Button>パターン管理</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CSVダウンロード</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">応答パターンのCSVテンプレートをダウンロードできます</p>
            <div className="space-y-2">
              <Link href="/admin/csv-download">
                <Button className="w-full">CSV編集画面</Button>
              </Link>
              <a href="/api/csv/download">
                <Button variant="outline" className="w-full">
                  直接ダウンロード
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>設定</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">LINE Botの各種設定を確認できます</p>
            <Button variant="outline">設定確認</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
