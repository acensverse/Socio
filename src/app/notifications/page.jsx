"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Heart, MessageSquare, UserPlus, AtSign, ArrowLeft, MoreHorizontal, Settings, Trash2, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"




const mockNotifications = {
  thisMonth: [
    {
      id: "1",
      type: "LIKE_GROUP",
      senders: [
        { name: "karelys.c24", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karelys" },
        { name: "acens.rz", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=acens" }
      ],
      count: 859,
      postMedia: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
      createdAt: "06 Jan",
      isRead: false
    }
  ],
  earlier: [
    {
      id: "2",
      type: "FOLLOW",
      sender: {
        id: "u1",
        name: "praney_meraki",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=praney"
      },
      createdAt: "13 Dec",
      isRead: true,
      isFollowing: true
    }
  ]
}

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background max-w-2xl mx-auto border-x border-gray-100 dark:border-zinc-800 pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 h-14">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </Link>
      </div>

      <div className="px-4 py-2 space-y-6">
        {/* This Month Section */}
        <section>
          <h2 className="text-lg font-bold mb-4">This month</h2>
          <div className="space-y-4">
            {mockNotifications.thisMonth.map((notif) => (
              <div key={notif.id} className="flex items-center gap-3">
                <div className="relative shrink-0 w-12 h-10 flex">
                   <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-background z-10 -ml-1 mt-1">
                      <Image src={notif.senders[1].avatar} alt="" fill className="object-cover" />
                   </div>
                   <div className="absolute left-2 top-0 w-9 h-9 rounded-full overflow-hidden border-2 border-background z-0">
                      <Image src={notif.senders[0].avatar} alt="" fill className="object-cover" />
                   </div>
                </div>
                <div className="flex-1 text-[15px] leading-tight pr-2">
                  <span className="font-bold">{notif.senders[0].name}</span>,{" "}
                  <span className="font-bold">{notif.senders[1].name}</span> and{" "}
                  {notif.count} others liked your post.{" "}
                  <span className="text-gray-400">{notif.createdAt}</span>
                </div>
                {notif.postMedia && (
                  <div className="relative shrink-0 w-11 h-11 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 cursor-pointer">
                    <Image src={notif.postMedia} alt="" fill className="object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Earlier Section */}
        <section>
          <h2 className="text-lg font-bold mb-4">Earlier</h2>
          <div className="space-y-6">
            {mockNotifications.earlier.map((notif) => (
              <div key={notif.id} className="flex items-center gap-3">
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gray-100 dark:border-zinc-800 shrink-0">
                  <Image src={notif.sender.avatar} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 text-[15px] leading-tight pr-2">
                  <span className="font-bold">{notif.sender.name}</span> started following you.{" "}
                  <span className="text-gray-400">{notif.createdAt}</span>
                </div>
                <button className={cn(
                  "px-4 py-1.5 rounded-lg text-sm font-bold transition-colors shrink-0",
                  notif.isFollowing 
                    ? "bg-gray-100 dark:bg-zinc-800 text-foreground hover:bg-gray-200" 
                    : "bg-primary text-white hover:bg-primary/90"
                )}>
                  {notif.isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
