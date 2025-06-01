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

function GridLines({ children, className }: GridProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 container grid auto-rows-auto grid-cols-[150px_150px_150px_1fr_150px_150px_150px] border-x border-white/10",
        className
      )}
    >
      {/* Left side - 3 vertical lines */}
      <div className="absolute top-0 bottom-0 left-[150px] w-px bg-white/10" />
      <div className="absolute top-0 bottom-0 left-[300px] w-px bg-white/10" />
      <div className="absolute top-0 bottom-0 left-[450px] w-px bg-white/10" />

      {/* Right side - 3 vertical lines (mirror of left) */}
      <div className="absolute top-0 right-[150px] bottom-0 w-px bg-white/10" />
      <div className="absolute top-0 right-[300px] bottom-0 w-px bg-white/10" />
      <div className="absolute top-0 right-[450px] bottom-0 w-px bg-white/10" />

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
}

function GridContainer({ children, className, showLines = true }: GridContainerProps) {
  return (
    <div className={cn("relative", className)}>
      {showLines && <GridLines />}
      <Grid>{children}</Grid>
    </div>
  )
}

export { GridLines, Grid, GridContainer }
