#!/bin/bash

# 管理者APIからstaffチェックを削除するスクリプト

FILES=(
  "app/api/admin/products/[id]/route.ts"
  "app/api/admin/products/[id]/questions/route.ts"
  "app/api/admin/clients/route.ts"
  "app/api/admin/questionnaires/route.ts"
  "app/api/admin/questionnaires/[id]/route.ts"
  "app/api/admin/questions/route.ts"
  "app/api/admin/questions/[id]/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # staffチェックのコードブロックを削除
    # パターン: // スタッフ確認 から if (!staff) { ... } まで
    perl -i -0777 -pe 's/\s*\/\/ スタッフ確認.*?if \(!staff\) \{.*?\n\s*\}\n//gs' "$file"

    echo "  ✅ Removed staff checks"
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 Complete!"
