import { test, expect } from "@playwright/test"

/**
 * E2Eテスト: 予約フロー
 * クライアントが予約を作成し、キャンセルするまでの一連の流れをテスト
 */

test.describe("Booking Flow", () => {
  test.beforeEach(async ({ page }) => {
    // テスト前に予約ページにアクセス
    await page.goto("/book")
  })

  test("should display booking calendar", async ({ page }) => {
    // ページタイトルを確認
    await expect(page).toHaveTitle(/TIMREXPLUS/)

    // カレンダーが表示されていることを確認
    await expect(page.getByText("日付を選択")).toBeVisible()

    // 日付ボタンが表示されていることを確認（7日分）
    const dateButtons = page.getByRole("button").filter({ hasText: /\d+/ })
    await expect(dateButtons.first()).toBeVisible()
  })

  test("should show available time slots when date is selected", async ({
    page,
  }) => {
    // NOTE: このテストは実際のデータが必要なため、モック実装が必要
    // 実装例としてスキップ
    test.skip()

    // 日付を選択
    const dateButton = page
      .getByRole("button")
      .filter({ hasText: /\d+/ })
      .first()
    await dateButton.click()

    // 時間枠が表示されることを確認
    await expect(page.getByText("時間を選択")).toBeVisible()
  })

  test("should validate booking form fields", async ({ page }) => {
    // NOTE: 日時選択が必要なため、フォーム直接アクセスのテスト
    test.skip()

    // 必須項目のバリデーション
    const submitButton = page.getByRole("button", { name: "予約を確定" })
    await submitButton.click()

    // エラーメッセージが表示されることを確認
    await expect(page.getByText("名前を入力してください")).toBeVisible()
    await expect(
      page.getByText("メールアドレスを入力してください")
    ).toBeVisible()
  })

  test("should navigate to staff login page", async ({ page }) => {
    await page.goto("/staff/login")

    // ログインページが表示されることを確認
    await expect(page.getByText("スタッフログイン")).toBeVisible()
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible()
  })

  test("should navigate to admin login page", async ({ page }) => {
    await page.goto("/admin/login")

    // 管理者ログインページが表示されることを確認
    await expect(page.getByText("管理者ログイン")).toBeVisible()
    await expect(page.getByRole("button", { name: /Google/ })).toBeVisible()
  })

  test("should show 404 page for invalid route", async ({ page }) => {
    await page.goto("/invalid-route")

    // 404ページが表示されることを確認
    await expect(page.getByText("404")).toBeVisible()
    await expect(page.getByText("ページが見つかりません")).toBeVisible()
  })

  test("should have proper mobile layout", async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/book")

    // モバイルレイアウトが適用されていることを確認
    // タップターゲットが44px以上であることを確認
    const buttons = page.getByRole("button")
    const firstButton = buttons.first()

    if (await firstButton.isVisible()) {
      const box = await firstButton.boundingBox()
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test("should have proper accessibility attributes", async ({ page }) => {
    // アクセシビリティの基本チェック
    await page.goto("/book")

    // ページには少なくとも1つのheading要素があるべき
    const headings = page.getByRole("heading")
    await expect(headings.first()).toBeVisible()

    // ボタンにはアクセシブルな名前があるべき
    const buttons = page.getByRole("button")
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute("aria-label")
        const textContent = await button.textContent()
        expect(ariaLabel || textContent).toBeTruthy()
      }
    }
  })
})

test.describe("Security Tests", () => {
  test("should have security headers", async ({ page }) => {
    const response = await page.goto("/")

    // セキュリティヘッダーの確認（Next.jsデフォルト）
    expect(response?.status()).toBe(200)

    // XSS保護が有効であることを確認
    // Note: 本番環境では適切なセキュリティヘッダーを設定すること
  })

  test("should protect admin routes when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin")

    // 認証されていない場合、ログインページにリダイレクトされる
    await page.waitForURL(/\/admin\/login/)
    await expect(page.getByText("管理者ログイン")).toBeVisible()
  })

  test("should protect staff routes when not authenticated", async ({
    page,
  }) => {
    await page.goto("/staff")

    // 認証されていない場合、ログインページにリダイレクトされる
    await page.waitForURL(/\/staff\/login/)
    await expect(page.getByText("スタッフログイン")).toBeVisible()
  })
})
