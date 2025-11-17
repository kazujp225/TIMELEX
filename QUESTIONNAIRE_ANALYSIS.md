# TUMELEXPLUS アンケート機能実装 - 徹底調査レポート

## 実行日時
2025-11-17

## 調査範囲
- questionnairesテーブル構造
- questionsテーブル構造
- booking_answersテーブル構造
- アンケート作成・編集のUI実装
- 予約フローとの関連
- データベーススキーマの全体像

---

## 1. データベーススキーマ分析

### 1.1 questionnairesテーブル
**ファイル**: `supabase/migrations/20250112_add_questionnaires.sql`

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | UUID | PRIMARY KEY | アンケート一意識別子 |
| `name` | VARCHAR(100) | NOT NULL | アンケート名 |
| `description` | TEXT | NULL | アンケートの説明 |
| `consultation_type_id` | UUID | NULL, FOREIGN KEY | 関連する相談種別（NULL時は全種別共通） |
| `is_active` | BOOLEAN | NOT NULL DEFAULT TRUE | 有効フラグ |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 | 表示順序 |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 更新日時 |

**インデックス**:
```sql
CREATE INDEX idx_questionnaires_consultation_type ON questionnaires(consultation_type_id);
CREATE INDEX idx_questionnaires_active ON questionnaires(is_active);
```

**トリガー**:
- `update_questionnaires_updated_at`: updated_at自動更新

**初期データ**:
```
- ID自動生成
- name: '一般相談用アンケート'
- description: '初回相談時に記入していただく基本情報'
- consultation_type_id: NULL（全種別で使用）
- is_active: TRUE
- display_order: 0
```

---

### 1.2 questionsテーブル
**ファイル**: `supabase/migrations/20250112_add_questionnaires.sql`

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | UUID | PRIMARY KEY | 質問一意識別子 |
| `questionnaire_id` | UUID | NOT NULL, FOREIGN KEY | 親アンケート |
| `question_text` | TEXT | NOT NULL | 質問文 |
| `question_type` | VARCHAR(20) | NOT NULL, CHECK | 質問タイプ |
| `options` | JSONB | NULL | 選択肢（radio/checkbox/select用） |
| `is_required` | BOOLEAN | NOT NULL DEFAULT FALSE | 必須フラグ |
| `display_order` | INTEGER | NOT NULL DEFAULT 0 | 表示順序 |
| `placeholder` | TEXT | NULL | プレースホルダーテキスト |
| `help_text` | TEXT | NULL | ヘルプテキスト |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 更新日時 |

**question_type列の制約値**:
- `text`: 短文入力
- `textarea`: 長文入力
- `radio`: ラジオボタン（単一選択）
- `checkbox`: チェックボックス（複数選択）
- `select`: プルダウン（単一選択）

**インデックス**:
```sql
CREATE INDEX idx_questions_questionnaire ON questions(questionnaire_id);
CREATE INDEX idx_questions_order ON questions(questionnaire_id, display_order);
```

**トリガー**:
- `update_questions_updated_at`: updated_at自動更新

**初期データ例**:
```
1. question_text: 'ご相談の目的を教えてください'
   question_type: 'textarea'
   is_required: TRUE
   placeholder: '例: 新規事業の立ち上げについて相談したい'
   help_text: 'できるだけ具体的にご記入ください'
   display_order: 0

2. question_text: 'ご相談の緊急度はどの程度ですか？'
   question_type: 'radio'
   options: ["できるだけ早く対応してほしい", "1週間以内に対応してほしい", "1ヶ月以内に対応してほしい", "特に急ぎではない"]
   is_required: TRUE
   display_order: 1

3. question_text: '当社をどこでお知りになりましたか？（複数選択可）'
   question_type: 'checkbox'
   options: ["検索エンジン", "SNS", "知人の紹介", "広告", "その他"]
   is_required: FALSE
   display_order: 2
```

---

### 1.3 booking_answersテーブル
**ファイル**: `supabase/migrations/20250112_add_questionnaires.sql`

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | UUID | PRIMARY KEY | 回答一意識別子 |
| `booking_id` | UUID | NOT NULL, FOREIGN KEY | 予約ID |
| `question_id` | UUID | NOT NULL, FOREIGN KEY | 質問ID |
| `answer_text` | TEXT | NULL | テキスト形式の回答 |
| `answer_json` | JSONB | NULL | JSON形式の回答（複数選択用） |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | 更新日時 |
| UNIQUE(booking_id, question_id) | | | 予約と質問の組み合わせは一意 |

**インデックス**:
```sql
CREATE INDEX idx_booking_answers_booking ON booking_answers(booking_id);
CREATE INDEX idx_booking_answers_question ON booking_answers(question_id);
```

**トリガー**:
- `update_booking_answers_updated_at`: updated_at自動更新

---

### 1.4 テーブル間のリレーション図

```
questionnaires
    ├─ id (UUID)
    ├─ consultation_type_id (FK → consultation_types.id)
    └─ questions[] (1:N)
         └─ booking_answers[] (1:N)
              └─ booking_id (FK → bookings.id)

bookings
    ├─ id (UUID)
    ├─ booking_answers[] (1:N)
    ├─ consultation_type_id (FK → consultation_types.id)
    └─ staff_id (FK → staff.id)
```

---

## 2. UI実装分析

### 2.1 アンケート管理ページ（一覧）
**ファイル**: `/app/admin/questionnaires/page.tsx`
**状態**: 本番稼働ではなくモックデータ表示

#### 機能概要
- アンケート一覧表示
- 検索機能（名前・説明）
- ステータスフィルター（全て/有効/無効）
- 相談種別フィルター
- 有効/無効トグル
- 編集・削除操作
- スケルトンローディング

#### データ構造
```typescript
interface ListItem {
  id: string
  name: string
  description: string | null
  consultation_type_id: string | null
  is_active: boolean
  display_order: number
  created_at: Date
  updated_at: Date
  consultation_type: { id: string; name: string } | null
  questions: any[]
}
```

#### 主要な機能メソッド
```typescript
filteredQuestionnaires = filter({
  searchQuery,
  statusFilter,
  typeFilter
})

handleToggleActive(id) // 有効/無効切り替え
handleDelete(id)       // 削除（確認ダイアログ付き）
```

#### UIコンポーネント
- Header: タイトル + 新規作成ボタン
- Search & Filters: 検索欄 + ステータスセレクト + 相談種別セレクト
- List: アンケート一覧表示
- Actions: 有効/無効トグル、編集、削除ボタン
- Empty State: アンケートなし時のメッセージ

---

### 2.2 アンケート作成ページ
**ファイル**: `/app/admin/questionnaires/new/page.tsx`
**状態**: フロントエンドロジックは実装済み、バックエンド保存はTODO

#### 主要機能
1. **基本情報入力**
   - アンケート名（必須、max 100文字）
   - 説明（任意）
   - 対象相談種別（任意）

2. **質問管理**
   - 質問追加
   - 質問タイプ選択
   - 選択肢管理
   - 質問並び替え（上下移動）
   - 質問削除
   - 必須フラグ設定

3. **オートセーブ機能**
   - ローカルストレージに2秒ごと自動保存
   - ドラフト復元機能

4. **プレビュー機能**
   - ダイアログでクライアント表示プレビュー
   - プレビュー上での入力テスト

#### バリデーション
```typescript
validate() {
  // アンケート名の必須チェック
  if (!formData.name.trim()) error
  
  // 質問数の最小チェック（最低1個）
  if (questions.length === 0) error
  
  // 各質問のバリデーション
  questions.forEach(q => {
    // 質問文の必須チェック
    // 選択型の場合、選択肢の必須チェック
    // 空の選択肢チェック
  })
}
```

#### 質問ビルダーコンポーネント（QuestionBuilder）
```typescript
interface QuestionForm {
  id: string                          // 仮ID（q-timestamp形式）
  question_text: string               // 質問文
  question_type: QuestionType         // 質問タイプ
  options: string[]                   // 選択肢（radio/checkbox/selectのみ）
  is_required: boolean                // 必須フラグ
  placeholder: string                 // プレースホルダー
  help_text: string                   // ヘルプテキスト
}
```

#### 操作
- 質問追加: `addQuestion()`
- 質問更新: `updateQuestion(id, updates)`
- 質問削除: `deleteQuestion(id)`
- 並び替え: `moveQuestion(id, "up"|"down")`
- 選択肢追加: `addOption(questionId)`
- 選択肢更新: `updateOption(questionId, index, value)`
- 選択肢削除: `deleteOption(questionId, index)`

---

### 2.3 アンケート編集ページ
**ファイル**: `/app/admin/questionnaires/[id]/page.tsx`
**状態**: 基本情報編集のみ実装、質問管理は未実装

#### 実装済み機能
1. **基本情報編集**
   - name（100文字以内）
   - description（500文字以内）
   - consultation_type_id
   - display_order
   - is_active

2. **質問一覧表示**
   - 読み取り専用表示
   - コメント: 「質問の追加・編集機能は今後実装予定」

3. **削除機能**
   - 危険な操作セクション
   - 確認ダイアログ付き
   - カスケード削除対応（質問も一緒に削除）

#### バリデーション
```typescript
validate() {
  // name: 1-100文字
  // description: 0-500文字
  // consultation_type_id: UUID形式（オプション）
  // display_order: 0以上の整数
}
```

#### 保存処理
```typescript
handleSubmit() {
  // PATCH /api/admin/questionnaires/[id]
  // 成功時: 一覧ページにリダイレクト
  // 失敗時: エラーメッセージ表示
}
```

---

### 2.4 予約フロー内のアンケームフォーム
**ファイル**: `/components/booking/QuestionnaireForm.tsx`
**状態**: UI実装済み

#### 機能概要
- 予約フロー内に埋め込まれる
- 複数の質問タイプに対応
- バリデーション対応
- エラーメッセージ表示

#### インターフェース
```typescript
interface QuestionnaireFormProps {
  questions: Question[]                        // 表示対象の質問
  answers: Record<string, string | string[]>   // 回答状態
  onChange: (questionId, answer) => void       // 回答変更ハンドラー
  errors: Record<string, string>               // エラーメッセージ
}
```

#### 質問タイプ別レンダリング
1. **text**: Input
2. **textarea**: Textarea
3. **radio**: ラジオボタングループ（ボーダー付きラベル）
4. **checkbox**: チェックボックスグループ（ボーダー付きラベル）
5. **select**: Select（プルダウン）

---

## 3. API実装分析

### 3.1 アンケート一覧API
**エンドポイント**: `GET /api/admin/questionnaires`
**ファイル**: `/app/api/admin/questionnaires/route.ts`

#### リクエスト
- 認証必須（NextAuth）

#### レスポンス
```json
{
  "questionnaires": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string | null",
      "consultation_type_id": "uuid | null",
      "is_active": true,
      "display_order": 0,
      "created_at": "2025-01-10T00:00:00Z",
      "updated_at": "2025-01-10T00:00:00Z",
      "consultation_type": { "id": "uuid", "name": "string" } | null,
      "questions": [
        {
          "id": "uuid",
          "question_text": "string",
          "question_type": "text|textarea|radio|checkbox|select",
          "options": ["option1", "option2"] | null,
          "is_required": true,
          "display_order": 0,
          "placeholder": "string | null",
          "help_text": "string | null"
        }
      ]
    }
  ]
}
```

#### バリデーション
```typescript
createQuestionnaireSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  consultation_type_id: z.string().uuid().optional().nullable(),
  display_order: z.number().int().min(0).default(0),
})
```

---

### 3.2 アンケート作成API
**エンドポイント**: `POST /api/admin/questionnaires`
**ファイル**: `/app/api/admin/questionnaires/route.ts`

#### リクエスト
```json
{
  "name": "string (1-100)",
  "description": "string (optional, max 500)",
  "consultation_type_id": "uuid (optional)",
  "display_order": "number (default 0)"
}
```

#### 処理フロー
1. 認証チェック
2. スタッフ権限チェック
3. Zodバリデーション
4. questionnairesテーブル挿入
5. 作成されたアンケート返却

#### レスポンス
```json
{
  "questionnaire": {
    "id": "uuid",
    "name": "string",
    "description": "string | null",
    "consultation_type_id": "uuid | null",
    "is_active": true,
    "display_order": 0,
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

### 3.3 アンケート詳細・更新API
**エンドポイント**: `GET/PATCH/DELETE /api/admin/questionnaires/[id]`
**ファイル**: `/app/api/admin/questionnaires/[id]/route.ts`

#### GET: 詳細取得
- 関連の質問も含めて返却
- 質問はdisplay_orderでソート

#### PATCH: 更新
```typescript
updateQuestionnaireSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  consultation_type_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
})
```

#### DELETE: 削除
- カスケード削除対応
- 関連する質問・回答も削除される

---

### 3.4 質問作成API
**エンドポイント**: `POST /api/admin/questions`
**ファイル**: `/app/api/admin/questions/route.ts`

#### リクエスト
```json
{
  "questionnaire_id": "uuid (required)",
  "question_text": "string (1-500)",
  "question_type": "text|textarea|radio|checkbox|select",
  "options": ["option1", "option2"] (optional, required for radio/checkbox/select),
  "is_required": false,
  "display_order": 0,
  "placeholder": "string (optional, max 100)",
  "help_text": "string (optional, max 200)"
}
```

#### バリデーション
```typescript
createQuestionSchema = z.object({
  questionnaire_id: z.string().uuid(),
  question_text: z.string().min(1).max(500),
  question_type: z.enum(["text", "textarea", "radio", "checkbox", "select"]),
  options: z.array(z.string()).optional().nullable(),
  is_required: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
  placeholder: z.string().max(100).optional().nullable(),
  help_text: z.string().max(200).optional().nullable(),
})

// 追加チェック
if (["radio", "checkbox", "select"].includes(question_type) && !options) {
  return error("Options are required")
}
```

---

### 3.5 質問更新・削除API
**エンドポイント**: `PATCH/DELETE /api/admin/questions/[id]`
**ファイル**: `/app/api/admin/questions/[id]/route.ts`

#### PATCH: 質問更新
```typescript
updateQuestionSchema = z.object({
  question_text: z.string().min(1).max(500).optional(),
  question_type: z.enum([...]).optional(),
  options: z.array(z.string()).optional().nullable(),
  is_required: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
  placeholder: z.string().max(100).optional().nullable(),
  help_text: z.string().max(200).optional().nullable(),
})
```

#### DELETE: 質問削除
- 関連するbooking_answersもカスケード削除

---

## 4. 型定義

**ファイル**: `/types/index.ts`

```typescript
enum QuestionType {
  TEXT = "text",
  TEXTAREA = "textarea",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  SELECT = "select",
}

interface Questionnaire {
  id: string
  name: string
  description?: string | null
  consultation_type_id?: string | null
  is_active: boolean
  display_order: number
  created_at: Date
  updated_at: Date
}

interface Question {
  id: string
  questionnaire_id: string
  question_text: string
  question_type: QuestionType
  options?: string[] | null
  is_required: boolean
  display_order: number
  placeholder?: string | null
  help_text?: string | null
  created_at: Date
  updated_at: Date
}

interface BookingAnswer {
  id: string
  booking_id: string
  question_id: string
  answer_text?: string | null
  answer_json?: string[] | null
  created_at: Date
  updated_at: Date
}

interface QuestionnaireWithQuestions extends Questionnaire {
  questions: Question[]
}

interface QuestionnaireCreateInput {
  name: string
  description?: string
  consultation_type_id?: string
  display_order?: number
}

interface QuestionCreateInput {
  questionnaire_id: string
  question_text: string
  question_type: QuestionType
  options?: string[]
  is_required?: boolean
  display_order?: number
  placeholder?: string
  help_text?: string
}

interface BookingAnswerInput {
  question_id: string
  answer_text?: string
  answer_json?: string[]
}
```

---

## 5. 予約フローとの関連性

### 5.1 現在の予約フロー
```
1. /book              - 相談種別選択
2. /book/select-date  - 日付選択
3. /book/select-slot  - スロット選択
4. /book/form         - クライアント情報入力
   ├─ 基本情報（名前、メール、会社、メモ）
   └─ アンケート（QuestionnaireForm）← アンケート機能の統合地点
5. /book/confirmation - 確認
6. /book/[id]/success - 完了
```

### 5.2 アンケーム機能の統合
**ファイル**: `/app/book/form/page.tsx`

```typescript
// 予約フォーム内でアンケートを表示する（未実装）
<BookingForm
  selectedSlot={slotWithDates}
  consultationTypes={consultationTypes}
  onSubmit={handleFormSubmit}  // 確認ページへ
  onBack={handleBack}
/>

// BookingForm内の構成（未実装だが計画中）
<form>
  {/* クライアント基本情報 */}
  <input name="client_name" />
  <input name="client_email" />
  
  {/* 該当するアンケーム */}
  <QuestionnaireForm
    questions={questions}
    answers={answers}
    onChange={setAnswers}
    errors={errors}
  />
  
  {/* 送信 */}
  <button type="submit">確認へ進む</button>
</form>
```

### 5.3 アンケーム選択ロジック
```typescript
// 予約時の相談種別に応じたアンケート取得
async function getApplicableQuestionnaires(consultationTypeId: string) {
  // 1. consultation_type_id がNULLのアンケート（全種別共通）
  // 2. consultation_type_id がマッチするアンケート
  // 上記をis_activeでフィルタ、display_orderでソート
}
```

### 5.4 予約作成時のアンケート回答保存（未実装）
```typescript
// POST /api/bookings時の流れ
1. クライアント情報を検証・保存
2. Google Calendarイベント作成
3. bookingを作成 → booking.id取得
4. 各質問に対するanswersをbooking_answersテーブルに保存
5. booking_answersテーブルに挿入
   {
     booking_id: booking.id,
     question_id: q.id,
     answer_text: answer,        // text/textarea用
     answer_json: answers        // checkbox/複数選択用
   }
```

---

## 6. 実装状況サマリー

### 6.1 実装済み機能
- [x] データベーススキーマ定義
  - questionnairesテーブル
  - questionsテーブル
  - booking_answersテーブル
  
- [x] アンケート管理UI（一覧）
  - 一覧表示（モックデータ）
  - 検索・フィルター
  - 有効/無効切り替え
  - 削除機能
  
- [x] アンケート作成UI
  - 基本情報入力
  - 質問ビルダー
  - 質問タイプ選択
  - オートセーブ
  - プレビュー機能
  
- [x] アンケート編集UI（基本情報のみ）
  - name/description編集
  - 相談種別指定
  - アクティブフラグ
  - 削除機能
  
- [x] 質問管理UI
  - 質問追加・削除
  - 質問タイプ選択
  - 選択肢管理
  - 並び替え
  - バリデーション
  
- [x] 予約フロー用コンポーネント
  - QuestionnaireForm（UI）
  - 複数の質問タイプ対応
  - エラーハンドリング
  
- [x] API実装
  - GET /api/admin/questionnaires
  - POST /api/admin/questionnaires
  - GET/PATCH/DELETE /api/admin/questionnaires/[id]
  - POST /api/admin/questions
  - PATCH/DELETE /api/admin/questions/[id]

### 6.2 未実装・TODO機能
- [ ] アンケート作成時のバックエンド保存
  - クライアント側: ローカルストレージのみ
  - サーバー側: API実装あり、UI側で呼び出し実装が必要
  
- [ ] 質問の編集UI
  - 作成は実装
  - 編集ページでの質問編集UI未実装
  - コメント: "質問の追加・編集機能は今後実装予定"
  
- [ ] 予約フローへのアンケーム統合
  - 相談種別に応じた該当アンケート取得
  - 予約フォーム内でのアンケーム表示
  - アンケーム回答の保存処理
  
- [ ] アンケーム回答の管理・表示
  - 予約詳細画面での回答表示
  - 管理画面での回答集計
  
- [ ] 回答データの分析・エクスポート
  - CSVエクスポート
  - レポート生成

---

## 7. ファイル構成

```
TUMELEXPLUS-main/
├── app/
│   ├── admin/
│   │   └── questionnaires/
│   │       ├── page.tsx                    # 一覧表示
│   │       ├── new/page.tsx                # 新規作成
│   │       └── [id]/page.tsx               # 編集（基本情報のみ）
│   ├── api/
│   │   └── admin/
│   │       ├── questionnaires/
│   │       │   ├── route.ts                # GET/POST
│   │       │   └── [id]/route.ts           # GET/PATCH/DELETE
│   │       └── questions/
│   │           ├── route.ts                # POST
│   │           └── [id]/route.ts           # PATCH/DELETE
│   └── book/
│       └── form/page.tsx                   # 予約フォーム
│
├── components/
│   └── booking/
│       └── QuestionnaireForm.tsx           # 予約フロー内アンケーム
│
├── types/
│   └── index.ts                            # 型定義（QuestionType等）
│
└── supabase/
    └── migrations/
        └── 20250112_add_questionnaires.sql # スキーマ定義
```

---

## 8. データフロー図

### 8.1 管理者のアンケーム作成フロー
```
管理者が新規作成ページにアクセス
    ↓
基本情報入力（name, description, consultation_type_id）
    ↓
質問追加→タイプ選択→選択肢入力（繰り返し）
    ↓
ローカルストレージに自動保存（2秒ごと）
    ↓
プレビューで確認
    ↓
「アンケートを作成」ボタン
    ↓
POST /api/admin/questionnaires
    ├─ name, description, consultation_type_id, display_order
    └─ (質問はまだ別途POSTが必要)
    ↓
questionnairesテーブルに挿入 → id返却
    ↓
質問を個別にPOST /api/admin/questions
    ├─ questionnaire_id, question_text, question_type, 
    │  options, is_required, display_order, placeholder, help_text
    └─ (各質問ごと)
    ↓
questionsテーブルに挿入
    ↓
一覧ページへリダイレクト
```

### 8.2 クライアントの予約時アンケーム回答フロー
```
クライアントが予約フローへ
    ↓
相談種別を選択 → 日付を選択 → スロットを選択
    ↓
予約フォームページ
    ├─ クライアント基本情報入力
    └─ 該当アンケーム表示（未実装）
         └─ 質問に回答
    ↓
「確認へ進む」ボタン
    ↓
POST /api/bookings
    ├─ クライアント情報
    ├─ start_time, end_time
    ├─ staff_id, consultation_type_id
    └─ 予定：回答データ
    ↓
    ├─ bookingsテーブルに予約挿入
    ├─ Google Calendarイベント作成
    └─ booking_answersテーブルに回答を挿入（未実装）
    ↓
確認ページ表示
```

---

## 9. パフォーマンス考慮事項

### 9.1 インデックス戦略
- `idx_questionnaires_consultation_type`: consultation_type_idでのフィルタリング高速化
- `idx_questionnaires_active`: is_activeフラグでのフィルタリング高速化
- `idx_questions_questionnaire`: アンケート内の質問取得を高速化
- `idx_questions_order`: display_orderでのソート最適化
- `idx_booking_answers_booking`: 予約に対する回答取得を高速化
- `idx_booking_answers_question`: 質問に対する全回答取得時の高速化

### 9.2 クエリ最適化
```sql
-- 最適なクエリ例
SELECT q.*, 
       json_agg(qu) as questions
FROM questionnaires q
LEFT JOIN questions qu ON q.id = qu.questionnaire_id
WHERE q.is_active = true
  AND q.consultation_type_id = $1
ORDER BY q.display_order, qu.display_order
GROUP BY q.id
```

---

## 10. セキュリティ考慮事項

### 10.1 実装済み
- [x] 認証チェック（管理者API全て）
- [x] スタッフ権限チェック
- [x] Zodスキーマによるバリデーション
- [x] SQL インジェクション対策（Supabaseクライアント使用）

### 10.2 今後検討すべき
- [ ] ROW LEVEL SECURITY (RLS) の設定
- [ ] 回答データの暗号化（個人情報を含む可能性）
- [ ] レート制限（アンケーム作成API）
- [ ] CSRF対策（フォーム送信時）
- [ ] 監査ログ（アンケーム変更履歴）

---

## 11. 今後の実装優先度

### Phase 1（緊急）
1. アンケーム作成時のバックエンド保存完成
   - 質問の同時保存処理を実装
   - トランザクション処理

2. 質問編集UI実装
   - 編集ページで質問の追加・編集・削除
   - 既存質問への回答影響を考慮

3. 予約フローへの統合
   - 相談種別に応じたアンケーム取得ロジック
   - フォーム内にの表示
   - 回答の保存処理

### Phase 2（重要）
1. アンケーム回答の管理画面
   - 予約詳細画面で回答表示
   - 回答の一覧表示・フィルタリング

2. アンケーム統計・分析
   - 複数選択項目の集計
   - CSV/Excelエクスポート
   - グラフ表示

### Phase 3（将来拡張）
1. 動的な質問表示
   - 条件分岐（"はい"なら次の質問を表示）

2. テンプレート機能
   - よく使うアンケームをテンプレート化

3. 多言語対応
   - 日本語以外の質問に対応

---

## 12. 結論

TUMELEXPLUSのアンケーム機能は以下のように分析されます:

**実装状況**: 約70%完了
- データベーススキーマ: 100%
- UI: 80%（編集UIが未実装）
- API: 80%（バックエンド完成、フロントエンド統合が未実装）
- 予約フロー統合: 20%（UIはあるが、ロジックが未実装）

**主な課題**:
1. 質問の編集UI未実装
2. アンケーム作成フローのバックエンド保存処理が分散している
3. 予約フロー内への統合処理（相談種別に応じた該当アンケーム取得、回答保存）がまだ

**推奨事項**:
1. 質問編集UI実装を優先
2. 予約フロー統合のロジックを整理
3. 回答データの保存処理を統一
4. エラーハンドリングの強化

---

**作成者**: Claude Code
**更新日**: 2025-11-17
**バージョン**: 1.0
