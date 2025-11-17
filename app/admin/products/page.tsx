"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string | null
  duration: number
  color: string
  is_active: boolean
  created_at: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/consultation-types")
      if (response.ok) {
        const data = await response.json()
        setProducts(data.consultationTypes || [])
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この商材を削除してもよろしいですか？")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/consultation-types/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchProducts()
      } else {
        alert("削除に失敗しました")
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
      alert("削除に失敗しました")
    }
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">商材管理</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            提供する商材と専用フォームを管理
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/products/new")}
          className="h-14 px-6 text-base font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          新規商材追加
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-2">
        {products.length === 0 ? (
          <Card className="border-2 col-span-full">
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                商材が登録されていません
              </p>
              <Button
                onClick={() => router.push("/admin/products/new")}
                className="mt-6 h-12 px-6 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                最初の商材を追加
              </Button>
            </CardContent>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: product.color }}
                      />
                      <CardTitle className="text-lg md:text-xl">{product.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admin/products/${product.id}`)}
                        className="h-8 px-2 md:px-3"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="h-8 px-2 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {product.duration}分
                    </span>
                    {product.is_active ? (
                      <span className="px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-100 rounded">
                        有効
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                        無効
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              {product.description && (
                <CardContent>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
