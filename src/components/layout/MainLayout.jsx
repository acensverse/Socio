"use client"

import { usePathname } from "next/navigation"
import { TopNav } from "./TopNav"
import { cn } from "@/lib/utils"

export function MainLayout({ children }) {
  const pathname = usePathname()
  const isReels = pathname === "/reels"
  const isMessages = pathname?.startsWith("/messages")
  const isLive = pathname === "/live"

  return (
    <main className={cn(
        "flex-1 w-full relative",
        !isMessages && !isReels && !isLive && "max-w-2xl mx-auto",
        isReels ? "z-[60]" : "pb-16 md:pb-0"
    )}>
      {!isReels && <TopNav />}
      <div className={cn(!isReels && "pt-0", isReels && "h-full")}>
        {children}
      </div>
    </main>
  )
}
