"use client"

import Image from "next/image"
import { formatDistanceToNow, format } from "date-fns"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Play, Heart, MessageSquare, Reply } from "lucide-react"

export function MessageThread({ messages, currentUserId }) {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="w-24 h-24 rounded-full border-4 border-foreground flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Start a conversation</h3>
        <p className="text-gray-500 max-w-[240px]">Send a message, photo or reel to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
      {/* Date separator mapping would go here, for now a mock one */}
      <div className="flex justify-center my-8">
        <span className="text-[11px] font-semibold text-gray-400">Fri 9:47 PM</span>
      </div>

      {messages.map((message) => {
        const isSent = message.senderId === currentUserId
        
        // Mock media identification (e.g., if content has a specific format or is a URL)
        const isMedia = message.content.includes("reel") || message.content.includes("attachment")

        return (
          <div
            key={message.id}
            className={cn(
                "flex gap-3 group items-end max-w-[85%]",
                isSent ? "self-end flex-row-reverse" : "self-start flex-row"
            )}
          >
            {!isSent && (
              <div className="relative w-8 h-8 shrink-0 mb-1">
                <Image
                  src={message.sender.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender.email}`}
                  alt={message.sender.name || "User"}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            
            <div className={cn("flex flex-col", isSent ? "items-end" : "items-start")}>
              {message.mediaUrl && message.mediaType ? (
                <div className={cn(
                  "relative rounded-[24px] overflow-hidden bg-black shadow-lg border border-gray-100 dark:border-zinc-800",
                  message.mediaType === 'video' ? "w-64 aspect-[9/16]" : "w-80 aspect-square"
                )}>
                  {message.mediaType === 'video' ? (
                    <video src={message.mediaUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <Image 
                      src={message.mediaUrl} 
                      alt="Attachment" 
                      fill 
                      className="object-cover" 
                    />
                  )}
                </div>
              ) : null}
              
              {message.content && (
                <div
                    className={cn(
                        "px-4 py-2.5 rounded-[22px] text-[15px] shadow-sm",
                        message.mediaUrl ? "mt-2" : "",
                        isSent
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "bg-gray-100 dark:bg-zinc-800 text-foreground"
                    )}
                >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              )}
              
              <span className={cn(
                "text-[10px] text-gray-400 mt-1 px-2 mb-1",
                isSent ? "text-right" : "text-left"
              )}>
                {format(new Date(message.createdAt), "h:mm a")}
              </span>
              
              <div className={cn(
                  "flex items-center gap-2 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity",
                  isSent ? "flex-row-reverse" : "flex-row"
              )}>
                 <button className="text-gray-400 hover:text-foreground">
                    <Heart className="w-4 h-4" />
                 </button>
                 <button className="text-gray-400 hover:text-foreground">
                    <Reply className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
