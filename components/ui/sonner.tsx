"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#2D2D2D] group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-[#666666]",
          actionButton:
            "group-[.toast]:bg-[#6EC5FF] group-[.toast]:text-white group-[.toast]:rounded",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-[#666666] group-[.toast]:rounded",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
