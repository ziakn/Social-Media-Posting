import { Loader2Icon } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({
  className,
  ...props
}) {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-8 animate-spin", className)}
      {...props} />
      </div>
  );
}

export { Spinner }
