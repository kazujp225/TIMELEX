"use client"

import { useEffect } from "react"

/**
 * ビューポート高さを動的に設定するクライアントコンポーネント
 * iOS対応のため、実際のビューポート高さをCSS変数として設定
 */
export function ViewportHeight() {
  useEffect(() => {
    function setVH() {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    // 初回設定
    setVH()

    // リサイズ・向き変更時に再設定
    window.addEventListener('resize', setVH)
    window.addEventListener('orientationchange', setVH)

    // クリーンアップ
    return () => {
      window.removeEventListener('resize', setVH)
      window.removeEventListener('orientationchange', setVH)
    }
  }, [])

  return null
}
