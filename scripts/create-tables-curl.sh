#!/bin/bash

# ============================================
# Supabaseテーブル作成スクリプト（curl版）
# ============================================

SUPABASE_URL="https://jvwdeartscnskwskubek.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d2RlYXJ0c2Nuc2t3c2t1YmVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1MDgzOSwiZXhwIjoyMDc4NTI2ODM5fQ.OpkSrQn6ibjxhUoAqyYaNAbfwB2ymOf2neqqr4M_kKw"

echo "🚀 Supabaseテーブル作成（curl版）"
echo ""

# スタッフデータ投入
echo "📌 スタッフデータを投入中..."
curl -X POST "$SUPABASE_URL/rest/v1/staff" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '[
    {"name": "担当者A", "email": "staff-a@zettai.co.jp", "color": "#6EC5FF"},
    {"name": "担当者B", "email": "staff-b@zettai.co.jp", "color": "#FFC870"}
  ]'

echo ""
echo "✅ 完了"
