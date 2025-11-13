#!/bin/bash

echo "🧪 予約枠の減少テスト"
echo ""

# 1. 予約前の9:00の状態を確認
echo "1️⃣ 予約前の9:00の空き枠を確認..."
BEFORE=$(curl -s "http://127.0.0.1:3002/api/slots/simple?date=2025-11-14&consultation_type_id=1" | jq '.slots[0]')
echo "$BEFORE" | jq
BEFORE_COUNT=$(echo "$BEFORE" | jq '.availableStaff | length')
echo "   空き枠数: ${BEFORE_COUNT}枠"
echo ""

# 2. 9:00に担当者Aで予約を入れる
echo "2️⃣ 9:00に担当者Aで予約を作成..."
BOOKING=$(curl -s -X POST http://127.0.0.1:3002/api/bookings/simple \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "テスト太郎",
    "client_email": "test@example.com",
    "client_company": "テスト株式会社",
    "client_memo": "枠減少テスト",
    "start_time": "2025-11-14T00:00:00.000Z",
    "end_time": "2025-11-14T00:30:00.000Z",
    "duration_minutes": 30,
    "staff_id": "28189167-5103-4b9d-831e-97975e4fd329",
    "staff_name": "担当者A",
    "consultation_type_id": "1"
  }')

BOOKING_ID=$(echo "$BOOKING" | jq -r '.booking_id')
if [ "$BOOKING_ID" != "null" ]; then
  echo "   ✅ 予約作成成功: ${BOOKING_ID}"
else
  echo "   ❌ 予約失敗"
  echo "$BOOKING" | jq
  exit 1
fi
echo ""

# 3. 予約後の9:00の状態を確認
echo "3️⃣ 予約後の9:00の空き枠を確認..."
sleep 1  # データ反映を待つ
AFTER=$(curl -s "http://127.0.0.1:3002/api/slots/simple?date=2025-11-14&consultation_type_id=1" | jq '.slots[0]')
echo "$AFTER" | jq
AFTER_COUNT=$(echo "$AFTER" | jq '.availableStaff | length')
echo "   空き枠数: ${AFTER_COUNT}枠"
echo ""

# 4. 結果判定
echo "📊 結果:"
echo "   予約前: ${BEFORE_COUNT}枠"
echo "   予約後: ${AFTER_COUNT}枠"
if [ "$AFTER_COUNT" -lt "$BEFORE_COUNT" ]; then
  echo "   ✅ 正常: 枠が ${BEFORE_COUNT} → ${AFTER_COUNT} に減少しました"
else
  echo "   ❌ 異常: 枠が減少していません"
fi
echo ""

# 5. クリーンアップ
echo "5️⃣ テスト予約を削除..."
curl -s -X DELETE "http://127.0.0.1:3002/api/admin/bookings/${BOOKING_ID}" > /dev/null
echo "   ✅ クリーンアップ完了"
