// Temporary workaround - AspectRatio without radix dependency
import * as React from "react"

const AspectRatio = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { ratio?: number }
>(({ ratio = 1, className, style, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: `${100 / ratio}%`,
        ...style,
      }}
      {...props}
    />
  )
})
AspectRatio.displayName = "AspectRatio"

export { AspectRatio }
