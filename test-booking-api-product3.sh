#!/bin/bash

echo "📧 商材3でメール送信テスト"
echo ""

curl -X POST http://localhost:3000/api/bookings/simple \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "テスト太郎",
    "client_email": "test@example.com",
    "client_company": "テスト株式会社",
    "start_time": "2025-11-20T14:00:00+09:00",
    "end_time": "2025-11-20T14:30:00+09:00",
    "duration_minutes": 30,
    "staff_id": "staff-1",
    "staff_name": "スタッフA",
    "consultation_type_id": "3",
    "consultation_type_name": ""
  }'

echo ""
echo ""
echo "✅ APIリクエスト完了"
echo "📧 team@zettai.co.jp のメールボックスを確認してください"
echo "📦 商材3（技術サポート）が表示されるはず"
