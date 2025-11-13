/**
 * 相談種別（商材）のマスターデータ
 * URLのID（1-6）と商材名をマッピング
 */

export interface ConsultationType {
  id: string
  name: string
  description?: string
  duration_minutes: number
}

export const CONSULTATION_TYPES: Record<string, ConsultationType> = {
  "1": {
    id: "1",
    name: "商材1（初回相談）",
    description: "初回のご相談",
    duration_minutes: 30,
  },
  "2": {
    id: "2",
    name: "商材2（導入支援）",
    description: "導入支援のご相談",
    duration_minutes: 45,
  },
  "3": {
    id: "3",
    name: "商材3（技術サポート）",
    description: "技術サポート",
    duration_minutes: 30,
  },
  "4": {
    id: "4",
    name: "商材4（コンサルティング）",
    description: "コンサルティング",
    duration_minutes: 60,
  },
  "5": {
    id: "5",
    name: "商材5（トレーニング）",
    description: "トレーニング",
    duration_minutes: 90,
  },
  "6": {
    id: "6",
    name: "商材6（その他）",
    description: "その他のご相談",
    duration_minutes: 30,
  },
}

/**
 * 相談種別IDから名前を取得
 */
export function getConsultationTypeName(id: string): string {
  return CONSULTATION_TYPES[id]?.name || `商材${id}`
}

/**
 * 相談種別IDから詳細情報を取得
 */
export function getConsultationType(id: string): ConsultationType | null {
  return CONSULTATION_TYPES[id] || null
}
