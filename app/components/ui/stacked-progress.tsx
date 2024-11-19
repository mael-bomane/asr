import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export type ProgressSegment = {
  value: number
  color?: string
}

type Props = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  segments: ProgressSegment[]
}

export const StackedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Props
>(
  ({ className, segments, ...props }, ref) => {
    const sortedSegments = segments.sort((a, b) => a.value - b.value)

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative h-4 w-full overflow-hidden rounded bg-secondary",
          className
        )}
        {...props}
      >
        {sortedSegments.map((segment, index) => (
          <ProgressPrimitive.Indicator
            key={index}
            className={cn("h-full transition-all absolute", segment.color ? segment.color : "bg-primary")}
            style={{ width: `${segment.value}%`, zIndex: sortedSegments.length - index }}
          />
        ))}
      </ProgressPrimitive.Root>
    )
  }
)

StackedProgress.displayName = "StackedProgress"

