import crypto from "crypto"

/**
 * AES-256-GCM暗号化ライブラリ
 * クライアント個人情報（氏名、メール、会社名、メモ）を暗号化
 */

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 16 // GCMモードでは12バイトまたは16バイト
const AUTH_TAG_LENGTH = 16
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""

if (!ENCRYPTION_KEY) {
  console.warn("⚠️ ENCRYPTION_KEY is not set. Data encryption is disabled.")
}

/**
 * 暗号化キーをバッファに変換
 * 32バイト（256ビット）のキーを生成
 */
function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY environment variable is required")
  }

  // SHA-256で32バイトのハッシュを生成
  return crypto.createHash("sha256").update(ENCRYPTION_KEY).digest()
}

/**
 * 文字列を暗号化
 * @param plaintext 平文
 * @returns 暗号化されたデータ（Base64エンコード）
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return ""
  }

  if (!ENCRYPTION_KEY) {
    console.warn("⚠️ Encryption disabled: returning plaintext")
    return plaintext
  }

  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    let encrypted = cipher.update(plaintext, "utf8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    // IV + AuthTag + 暗号文 の順で結合してBase64エンコード
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, "hex"),
    ])

    return combined.toString("base64")
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

/**
 * 暗号化されたデータを復号化
 * @param ciphertext 暗号文（Base64エンコード）
 * @returns 復号化された平文
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) {
    return ""
  }

  if (!ENCRYPTION_KEY) {
    console.warn("⚠️ Decryption disabled: returning ciphertext as-is")
    return ciphertext
  }

  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(ciphertext, "base64")

    // IV、AuthTag、暗号文を分離
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}

/**
 * 複数フィールドを暗号化
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const encrypted = { ...data }

  for (const field of fields) {
    if (encrypted[field] && typeof encrypted[field] === "string") {
      encrypted[field] = encrypt(encrypted[field] as string) as any
    }
  }

  return encrypted
}

/**
 * 複数フィールドを復号化
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): T {
  const decrypted = { ...data }

  for (const field of fields) {
    if (decrypted[field] && typeof decrypted[field] === "string") {
      try {
        decrypted[field] = decrypt(decrypted[field] as string) as any
      } catch (error) {
        console.error(`Failed to decrypt field ${String(field)}:`, error)
        // 復号化失敗時は元の値を保持
      }
    }
  }

  return decrypted
}

/**
 * ランダムな暗号化キーを生成（初回セットアップ用）
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * 暗号化が有効かチェック
 */
export function isEncryptionEnabled(): boolean {
  return !!ENCRYPTION_KEY
}
