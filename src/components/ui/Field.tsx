/**
 * General UI v1 - Field Component
 * Form field wrapper with label, input, and help text
 */

import React from "react"
import { cn } from "@/lib/utils"

export interface FieldProps {
  label?: string
  required?: boolean
  help?: string
  error?: string
  children: React.ReactNode
  className?: string
}

const Field: React.FC<FieldProps> = ({
  label,
  required = false,
  help,
  error,
  children,
  className,
}) => {
  return (
    <div className={cn("field", className)}>
      {label && (
        <label className="block text-sm font-medium text-text mb-1.5">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      {children}
      {(help || error) && (
        <p className={cn("help", error && "text-danger")}>{error || help}</p>
      )}
    </div>
  )
}

Field.displayName = "Field"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "input w-full",
          error && "border-danger focus:ring-danger",
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "input w-full min-h-[100px] resize-y",
          error && "border-danger focus:ring-danger",
          className
        )}
        {...props}
      />
    )
  }
)

Textarea.displayName = "Textarea"

export { Field, Input, Textarea }
