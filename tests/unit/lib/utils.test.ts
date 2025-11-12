import { formatDate, getWeekday, validateEmail, cn } from "@/lib/utils"

/**
 * ユーティリティ関数のユニットテスト
 */

describe("Utils", () => {
  describe("formatDate", () => {
    it("should format date as YYYY/MM/DD", () => {
      const date = new Date("2025-01-15T10:30:00Z")
      expect(formatDate(date, "YYYY/MM/DD")).toMatch(/2025\/01\/15/)
    })

    it("should format date as HH:mm", () => {
      const date = new Date("2025-01-15T10:30:00Z")
      const formatted = formatDate(date, "HH:mm")
      expect(formatted).toMatch(/\d{2}:\d{2}/)
    })

    it("should format date as YYYY/MM/DD HH:mm", () => {
      const date = new Date("2025-01-15T10:30:00Z")
      const formatted = formatDate(date, "YYYY/MM/DD HH:mm")
      expect(formatted).toMatch(/2025\/01\/15 \d{2}:\d{2}/)
    })
  })

  describe("getWeekday", () => {
    it("should return short weekday names in Japanese", () => {
      const monday = new Date("2025-01-13T00:00:00Z") // 月曜日
      expect(getWeekday(monday, "short")).toBe("月")
    })

    it("should return long weekday names in Japanese", () => {
      const monday = new Date("2025-01-13T00:00:00Z") // 月曜日
      expect(getWeekday(monday, "long")).toBe("月曜日")
    })
  })

  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      expect(validateEmail("test@example.com")).toBe(true)
      expect(validateEmail("user+tag@domain.co.jp")).toBe(true)
      expect(validateEmail("name.surname@company.com")).toBe(true)
    })

    it("should reject invalid email addresses", () => {
      expect(validateEmail("invalid")).toBe(false)
      expect(validateEmail("@example.com")).toBe(false)
      expect(validateEmail("user@")).toBe(false)
      expect(validateEmail("user @example.com")).toBe(false)
      expect(validateEmail("")).toBe(false)
    })
  })

  describe("cn (classNames merger)", () => {
    it("should merge class names", () => {
      const result = cn("class1", "class2")
      expect(result).toContain("class1")
      expect(result).toContain("class2")
    })

    it("should handle conditional classes", () => {
      const isActive = true
      const result = cn("base", isActive && "active")
      expect(result).toContain("base")
      expect(result).toContain("active")
    })

    it("should handle Tailwind conflicts with twMerge", () => {
      const result = cn("px-2", "px-4")
      // twMergeがpx-4を優先するべき
      expect(result).toContain("px-4")
      expect(result).not.toContain("px-2")
    })
  })
})
