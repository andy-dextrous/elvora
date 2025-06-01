import React from "react"
import { cn } from "@/utilities/ui"

/*************************************************************************/
/*  GRID SYSTEM COMPONENTS
/*************************************************************************/

interface GridProps {
  children?: React.ReactNode
  className?: string
}

/*************************************************************************/
/*  BACKGROUND GRID LINES - Shows visual grid structure
/*************************************************************************/

interface GridLinesProps extends GridProps {
  fadeLines?: boolean
}

function GridLines({ children, className, fadeLines = false }: GridLinesProps) {
  const lineClasses = fadeLines
    ? "bg-gradient-to-b from-transparent to-95% to-white/5"
    : "bg-white/7"

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 container grid auto-rows-auto grid-cols-[150px_150px_150px_1fr_150px_150px_150px] border-x border-white/7",
        className
      )}
    >
      {/* Left side - 3 vertical lines */}
      <div className={cn("absolute top-0 bottom-0 left-[150px] w-px", lineClasses)} />
      <div className={cn("absolute top-0 bottom-0 left-[300px] w-px", lineClasses)} />
      <div className={cn("absolute top-0 bottom-0 left-[450px] w-px", lineClasses)} />

      {/* Right side - 3 vertical lines (mirror of left) */}
      <div className={cn("absolute top-0 right-[150px] bottom-0 w-px", lineClasses)} />
      <div className={cn("absolute top-0 right-[300px] bottom-0 w-px", lineClasses)} />
      <div className={cn("absolute top-0 right-[450px] bottom-0 w-px", lineClasses)} />

      {/* Grid column spacers - invisible but maintain grid structure */}
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      {children}
    </div>
  )
}

/*************************************************************************/
/*  CONTENT GRID - Contains actual content with higher z-index
/*************************************************************************/

function Grid({ children, className }: GridProps) {
  return (
    <div
      className={cn(
        "relative z-20 container grid auto-rows-auto grid-cols-[150px_150px_150px_1fr_150px_150px_150px]",
        className
      )}
    >
      {children}
    </div>
  )
}

/*************************************************************************/
/*  GRID CONTAINER - Wraps both background lines and content
/*************************************************************************/

interface GridContainerProps {
  children?: React.ReactNode
  className?: string
  showLines?: boolean
  fadeLines?: boolean
}

function GridContainer({
  children,
  className,
  showLines = true,
  fadeLines = false,
}: GridContainerProps) {
  return (
    <div className={cn("relative", className)}>
      {showLines && <GridLines fadeLines={fadeLines} />}
      <Grid>{children}</Grid>
    </div>
  )
}

export { GridLines, Grid, GridContainer }
