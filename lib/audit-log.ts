import { supabaseAdmin } from "@/lib/supabase/client"
import { ActorType, AuditAction } from "@/types"

/**
 * 監査ログシステム
 * 重要な操作を記録
 */

interface AuditLogEntry {
  actor_type: ActorType
  actor_id?: string
  action: AuditAction
  resource_type: string
  resource_id?: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
}

/**
 * 監査ログを記録
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("audit_logs")
      .insert({
        actor_type: entry.actor_type,
        actor_id: entry.actor_id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        details: entry.details,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error("Failed to log audit entry:", error)
    }
  } catch (error) {
    console.error("Audit log error:", error)
    // 監査ログ失敗でもメイン処理は継続
  }
}

/**
 * 予約関連の監査ログ
 */
export const bookingAudit = {
  created: (bookingId: string, clientEmail: string, ipAddress?: string, userAgent?: string) =>
    logAudit({
      actor_type: ActorType.CLIENT,
      action: AuditAction.CREATE,
      resource_type: "booking",
      resource_id: bookingId,
      details: { client_email: clientEmail },
      ip_address: ipAddress,
      user_agent: userAgent,
    }),

  cancelled: (bookingId: string, cancelToken: string, ipAddress?: string, userAgent?: string) =>
    logAudit({
      actor_type: ActorType.CLIENT,
      action: AuditAction.CANCEL,
      resource_type: "booking",
      resource_id: bookingId,
      details: { cancel_token_used: true },
      ip_address: ipAddress,
      user_agent: userAgent,
    }),

  updated: (bookingId: string, staffId: string, changes: Record<string, any>) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: staffId,
      action: AuditAction.UPDATE,
      resource_type: "booking",
      resource_id: bookingId,
      details: changes,
    }),

  viewed: (bookingId: string, staffId: string) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: staffId,
      action: AuditAction.VIEW,
      resource_type: "booking",
      resource_id: bookingId,
    }),
}

/**
 * スタッフ関連の監査ログ
 */
export const staffAudit = {
  created: (staffId: string, adminId: string, details: Record<string, any>) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: adminId,
      action: AuditAction.CREATE,
      resource_type: "staff",
      resource_id: staffId,
      details,
    }),

  updated: (staffId: string, adminId: string, changes: Record<string, any>) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: adminId,
      action: AuditAction.UPDATE,
      resource_type: "staff",
      resource_id: staffId,
      details: changes,
    }),

  deleted: (staffId: string, adminId: string) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: adminId,
      action: AuditAction.CANCEL,
      resource_type: "staff",
      resource_id: staffId,
    }),

  login: (staffId: string, ipAddress?: string, userAgent?: string) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: staffId,
      action: AuditAction.VIEW,
      resource_type: "staff",
      resource_id: staffId,
      ip_address: ipAddress,
      user_agent: userAgent,
    }),

  logout: (staffId: string) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: staffId,
      action: AuditAction.VIEW,
      resource_type: "staff",
      resource_id: staffId,
    }),
}

/**
 * 設定関連の監査ログ
 */
export const settingsAudit = {
  updated: (adminId: string, changes: Record<string, any>) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: adminId,
      action: AuditAction.UPDATE,
      resource_type: "settings",
      details: changes,
    }),
}

/**
 * データアクセスの監査ログ
 */
export const dataAccessAudit = {
  exported: (adminId: string, resourceType: string, recordCount: number) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: adminId,
      action: AuditAction.VIEW,
      resource_type: resourceType,
      details: { record_count: recordCount },
    }),

  bulkDeleted: (adminId: string, resourceType: string, recordIds: string[]) =>
    logAudit({
      actor_type: ActorType.STAFF,
      actor_id: adminId,
      action: AuditAction.CANCEL,
      resource_type: resourceType,
      details: { record_ids: recordIds, count: recordIds.length },
    }),
}

/**
 * 監査ログを検索
 */
export async function searchAuditLogs(filters: {
  actorType?: ActorType
  actorId?: string
  action?: AuditAction
  resourceType?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}) {
  try {
    let query = supabaseAdmin.from("audit_logs").select("*")

    if (filters.actorType) {
      query = query.eq("actor_type", filters.actorType)
    }

    if (filters.actorId) {
      query = query.eq("actor_id", filters.actorId)
    }

    if (filters.action) {
      query = query.eq("action", filters.action)
    }

    if (filters.resourceType) {
      query = query.eq("resource_type", filters.resourceType)
    }

    if (filters.startDate) {
      query = query.gte("created_at", filters.startDate.toISOString())
    }

    if (filters.endDate) {
      query = query.lte("created_at", filters.endDate.toISOString())
    }

    query = query
      .order("created_at", { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Failed to search audit logs:", error)
    return []
  }
}
