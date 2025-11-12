import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSSのクラス名をマージするユーティリティ関数
 * 競合するクラスを適切に処理し、最後のクラスを優先する
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 日付をフォーマットする
 */
export function formatDate(date: Date, format: string = "YYYY/MM/DD"): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
}

/**
 * 曜日を取得する
 */
export function getWeekday(date: Date, format: "short" | "long" = "short"): string {
  const weekdays = {
    short: ["日", "月", "火", "水", "木", "金", "土"],
    long: ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
  }
  return weekdays[format][date.getDay()]
}

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * URLからUTMパラメータを抽出
 */
export function extractUTMParams(url: string) {
  const urlObj = new URL(url)
  return {
    utm_source: urlObj.searchParams.get("utm_source") || undefined,
    utm_medium: urlObj.searchParams.get("utm_medium") || undefined,
    utm_campaign: urlObj.searchParams.get("utm_campaign") || undefined,
    utm_content: urlObj.searchParams.get("utm_content") || undefined,
    utm_term: urlObj.searchParams.get("utm_term") || undefined,
  }
}
