/**
 * General UI v1 - Button Component
 * Unified button with consistent styling and accessibility
 */

import React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-3 rounded-xl font-bold border transition-all duration-200 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
      primary:
        "bg-brand-600 text-white border-transparent shadow-sm hover:bg-brand-500",
      secondary:
        "bg-white text-text border-border shadow-sm hover:bg-panel-muted",
      outline:
        "bg-transparent text-text border-border hover:bg-panel-muted",
      ghost: "bg-transparent text-muted border-transparent hover:bg-panel-muted hover:text-text",
    }

    const sizes = {
      sm: "px-4 py-2 text-sm min-h-[36px]",
      md: "px-[18px] py-[14px] text-base min-h-[44px]",
      lg: "px-6 py-4 text-lg min-h-[52px]",
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!loading && icon && <span aria-hidden="true">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
