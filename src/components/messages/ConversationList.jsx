"use client"

import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export function ConversationList({ conversations, selectedId, onSelect }) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <p className="text-sm font-medium">No messages found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const user = conversation.otherUser
        if (!user) return null

        const avatar = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        const displayName = user.name || user.email?.split("@")[0] || "User"
        const isActive = selectedId === conversation.id

        return (
          <div
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
                "flex items-center gap-4 px-4 py-3 cursor-pointer transition-all border-l-[3px] border-transparent",
                isActive ? "bg-gray-100 dark:bg-zinc-800 border-l-foreground" : "hover:bg-gray-50 dark:hover:bg-zinc-900"
            )}
          >
            <div className="relative w-14 h-14 shrink-0">
              <Image
                src={avatar}
                alt={displayName}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn(
                    "text-[15px] truncate",
                    conversation.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-gray-700 dark:text-gray-300"
                )}>
                  {displayName}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className={cn(
                    "text-sm truncate flex-1",
                    conversation.unreadCount > 0 ? "font-bold text-foreground" : "text-gray-400"
                )}>
                  {conversation.lastMessage?.content || "Started a conversation"}
                </p>
                {conversation.lastMessage && (
                    <>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: false })
                                .replace("about ", "")
                                .replace("less than a minute", "now")
                                .replace(" minute", "m")
                                .replace(" minutes", "m")
                                .replace(" hour", "h")
                                .replace(" hours", "h")
                                .replace(" day", "d")
                                .replace(" days", "d")
                            }
                        </span>
                    </>
                )}
              </div>
            </div>
            {conversation.unreadCount > 0 && (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
            )}
          </div>
        )
      })}
    </div>
  )
}
