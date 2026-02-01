"use client"

import Link from "next/link"
import { Twitter, LogOut, Heart } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function TopNav() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (pathname === "/reels" || pathname?.startsWith("/messages")) return null

  return (
    <div className="md:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 h-14 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
         <Twitter className="w-6 h-6 text-primary" fill="currentColor" />
         <span className="text-lg font-bold">Socio</span>
      </Link>

      <Link href="/notifications" className="p-2 -mr-2 text-gray-900 dark:text-white relative">
        <Heart className="w-6 h-6" />
        {/* Optional red dot if unread notifications exist */}
      </Link>
    </div>
  )
}
