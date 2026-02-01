"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Clapperboard, MessageCircle, Heart, PlusSquare, User, Menu, Twitter, LogOut, Radio, Settings, Moon, Sun, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { useState, useEffect } from "react"

const sidebarItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Clapperboard, label: "Reels", href: "/reels" },
  { icon: Radio, label: "Live", href: "/live", isLive: true },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: Heart, label: "Notifications", href: "/notifications" },
  { icon: PlusSquare, label: "Create", href: "/create" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [showMore, setShowMore] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDarkMode(false)
    }
  }, [])

  const setLightMode = () => {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("theme", "light")
    setIsDarkMode(false)
  }

  const setDarkMode = () => {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
    setIsDarkMode(true)
  }

  const isAuthPage = pathname === "/login" || pathname === "/register"
  if (isAuthPage) return null

  return (
    <aside className="hidden md:flex flex-col w-[244px] h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800 px-4 py-6 bg-background">
      <div className="mb-8 px-4">
        <Link href="/" className="flex items-center gap-2">
           <Twitter className="w-8 h-8 text-primary" fill="currentColor" />
           <span className="text-xl font-bold hidden xl:block">Socio</span>
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors group",
                isActive && "font-bold"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-7 h-7", isActive ? "stroke-[3px]" : "stroke-[2px]", item.isLive && "text-red-500")} />
                {item.isLive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                )}
              </div>
              <span className={cn("text-lg hidden xl:block", isActive ? "font-bold" : "font-normal", item.isLive && "text-red-500 font-bold")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 relative">
        {showMore && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMore(false)}
            />
            <div className="absolute bottom-full left-0 mb-2 w-[220px] bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {!isDarkMode ? (
                <button 
                  onClick={() => {
                    setDarkMode()
                    setShowMore(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="font-bold">Dark mode</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setLightMode()
                    setShowMore(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Sun className="w-4 h-4" />
                  </div>
                  <span className="font-bold">Light mode</span>
                </button>
              )}

              <Link 
                href="/settings"
                onClick={() => setShowMore(false)}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-300">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="font-bold">Settings</span>
              </Link>

              <button 
                onClick={() => {
                  // Switch accounts logic
                  setShowMore(false)
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-black dark:text-white"
              >
                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 dark:text-green-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="font-bold">Switch accounts</span>
              </button>

              <div className="my-2 border-t border-gray-100 dark:border-zinc-800" />

              <button 
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="font-bold">Logout</span>
              </button>
            </div>
          </>
        )}

        <button 
          onClick={() => setShowMore(!showMore)}
          className={cn(
            "flex items-center gap-4 p-3 w-full rounded-full hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors text-left",
            showMore && "bg-gray-100 dark:bg-gray-900 font-bold"
          )}
        >
          <Menu className="w-7 h-7" />
          <span className="text-lg hidden xl:block">More</span>
        </button>
      </div>
    </aside>
  )
}
