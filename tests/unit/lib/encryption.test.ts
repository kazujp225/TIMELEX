import { encrypt, decrypt, encryptFields, decryptFields } from "@/lib/encryption"

/**
 * 暗号化ライブラリのユニットテスト
 */

describe("Encryption", () => {
  // テスト用の暗号化キーを設定
  const originalKey = process.env.ENCRYPTION_KEY

  beforeAll(() => {
    process.env.ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
  })

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalKey
  })

  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt a string correctly", () => {
      const plaintext = "Hello, World!"
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(encrypted).not.toBe(plaintext)
      expect(decrypted).toBe(plaintext)
    })

    it("should handle empty strings", () => {
      const plaintext = ""
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it("should handle Japanese characters", () => {
      const plaintext = "こんにちは、世界！"
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })

    it("should produce different ciphertext for the same plaintext", () => {
      const plaintext = "Test message"
      const encrypted1 = encrypt(plaintext)
      const encrypted2 = encrypt(plaintext)

      // IVがランダムなので、同じ平文でも暗号文は異なる
      expect(encrypted1).not.toBe(encrypted2)

      // しかし、両方とも正しく復号化できる
      expect(decrypt(encrypted1)).toBe(plaintext)
      expect(decrypt(encrypted2)).toBe(plaintext)
    })

    it("should handle long strings", () => {
      const plaintext = "a".repeat(1000)
      const encrypted = encrypt(plaintext)
      const decrypted = decrypt(encrypted)

      expect(decrypted).toBe(plaintext)
    })
  })

  describe("encryptFields and decryptFields", () => {
    it("should encrypt and decrypt specified fields", () => {
      const data = {
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        age: 30,
      }

      const encrypted = encryptFields(data, ["name", "email"])

      expect(encrypted.id).toBe(data.id)
      expect(encrypted.age).toBe(data.age)
      expect(encrypted.name).not.toBe(data.name)
      expect(encrypted.email).not.toBe(data.email)

      const decrypted = decryptFields(encrypted, ["name", "email"])

      expect(decrypted).toEqual(data)
    })

    it("should handle missing fields gracefully", () => {
      const data = {
        id: "123",
        name: "John Doe",
      }

      const encrypted = encryptFields(data, ["name", "email" as any])

      expect(encrypted.name).not.toBe(data.name)
      expect(encrypted.email).toBeUndefined()
    })

    it("should not encrypt non-string fields", () => {
      const data = {
        id: 123,
        name: "John Doe",
        active: true,
      }

      const encrypted = encryptFields(data, ["id", "name", "active"] as any)

      expect(encrypted.id).toBe(123) // 数値はそのまま
      expect(encrypted.active).toBe(true) // booleanはそのまま
      expect(encrypted.name).not.toBe(data.name) // 文字列のみ暗号化
    })
  })
})
