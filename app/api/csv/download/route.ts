import { NextResponse } from "next/server"

export async function GET() {
  const csvContent = `input,output,type,image_url,sender_name,sender_icon_url,quick_replies,buttons
こんにちは,こんにちは！何かお手伝いできることはありますか？,text,,,,,
おはよう,おはようございます！今日も素晴らしい一日になりますように。,text,https://example.com/morning.jpg,おはようBot,https://example.com/morning-icon.jpg,,
天気,今日の天気をお調べします,quick_reply,,,,今日の天気|明日の天気|週間天気,
メニュー,どちらをお選びになりますか？,buttons,,,,,サービス案内|料金プラン|お問い合わせ
商品案内,おすすめ商品をご紹介します,carousel,,,,,商品A|商品B|商品C
ニュース,最新ニュースです,text,https://example.com/news.jpg,ニュースBot,https://example.com/news-icon.jpg,,
ありがとう,どういたしまして！他にお手伝いできることがあればお知らせください。,text,,,,,
さようなら,さようなら！またのご利用をお待ちしております。,text,,,,,
help,以下のコマンドが利用可能です：\\n・こんにちは - 挨拶\\n・天気 - 天気情報\\n・メニュー - サービスメニュー\\n・help - このヘルプメッセージ,text,,,,,`

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="responses.csv"',
    },
  })
}
