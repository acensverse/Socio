"use client"

import Image from "next/image"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { LiveStream } from "./mockData"


export function LiveStreamCard({ stream, onClick }) {
  return (
    <div 
      onClick={() => onClick(stream)}
      className="group cursor-pointer bg-white dark:bg-zinc-900 rounded-2xl md:rounded-[32px] overflow-hidden border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-2xl hover:scale-[1.02] hover:border-red-500/30"
    >
      <div className="relative aspect-video">
        <Image 
          src={stream.thumbnail} 
          alt={stream.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {stream.isLive && (
          <div className="absolute top-3 left-3 md:top-4 md:left-4 flex items-center gap-1.5 md:gap-2 bg-red-500 text-white text-[8px] md:text-[10px] font-black px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-md uppercase tracking-widest animate-pulse">
            <span className="w-1 h-1 bg-white rounded-full" />
            Live
          </div>
        )}
        
        {stream.isLive && (
          <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-1 md:gap-1.5 bg-black/40 backdrop-blur-md text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full border border-white/10">
            <Users className="w-2.5 h-2.5 md:w-3 md:h-3" />
            {stream.viewers.toLocaleString()}
          </div>
        )}
      </div>
      
      <div className="p-4 md:p-5">
        <div className="flex gap-3 md:gap-4">
          <div className="relative w-9 h-9 md:w-10 md:h-10 shrink-0">
            <Image 
              src={stream.userImage} 
              alt={stream.userName}
              fill
              className="rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
            />
            {stream.isLive && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
              {stream.title}
            </h3>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {stream.userName}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
