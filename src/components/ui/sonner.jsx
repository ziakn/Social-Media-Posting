"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--divider)",
          "--border-radius": "10px",
          "--success-bg": "var(--success)",
          "--success-text": "#FFFFFF",
          "--success-border": "var(--success)",
          "--error-bg": "var(--error)",
          "--error-text": "#FFFFFF",
          "--error-border": "var(--error)",
          "--warning-bg": "var(--warning)",
          "--warning-text": "#FFFFFF",
          "--warning-border": "var(--warning)",
          "--info-bg": "var(--info)",
          "--info-text": "#FFFFFF",
          "--info-border": "var(--info)",
        }
      }
      {...props} />
  );
}

export { Toaster }
