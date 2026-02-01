"use client"

import Link from "next/link"
import { Settings, Info, FileText, Shield, ChevronRight, User, Bell } from "lucide-react"

export default function SettingsPage() {
  const settingsGroups = [
    {
      title: "General",
      items: [
        { icon: User, label: "Account", href: "/settings/account" },
        { icon: Bell, label: "Notifications", href: "/settings/notifications" },
      ]
    },
    {
      title: "Information",
      items: [
        { icon: Info, label: "About", href: "/about" },
        { icon: FileText, label: "Terms and Conditions", href: "/terms" },
        { icon: Shield, label: "Privacy Policy", href: "/privacy" },
      ]
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground md:pl-0 pb-20 md:pb-0">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto w-full space-y-8">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <h2 className="px-4 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {group.title}
            </h2>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm">
              {group.items.map((item, index) => {
                const Icon = item.icon
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-gray-100 dark:border-zinc-800 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-900 dark:text-white">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-lg">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        <div className="px-4 text-center text-sm text-gray-500 dark:text-gray-400 pt-8">
          <p>Socio v1.0.0 alpha</p>
          <p className="mt-1">Built by Acens</p>
        </div>
      </div>
    </div>
  )
}
