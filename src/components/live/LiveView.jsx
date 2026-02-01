"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { X, Users, Share2, MoreHorizontal, Maximize2, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { LiveStream } from "./mockData"
import { LiveChat } from "./LiveChat"


export function LiveView({ stream, onClose }) {
  const [isMaximized, setIsMaximized] = useState(true);
  const [isUIActive, setUIActive] = useState(true);
  const [timer, setTimer] = useState(null);

  const handleMouseMove = () => {
    setUIActive(true);
    if (timer) clearTimeout(timer);
    
    // Hide UI after 3 seconds of inactivity
    const newTimer = setTimeout(() => {
      setUIActive(false);
    }, 3000);
    
    setTimer(newTimer);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    }
  }, [timer]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300">
      {/* Video Content Container */}
      <div 
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setUIActive(false)}
        className={cn(
        "relative h-full bg-black overflow-hidden group transition-all duration-300",
        isMaximized ? "w-full" : "flex-1"
      )}>
        <div className="absolute inset-0">
          <Image 
            src={stream.thumbnail} 
            alt={stream.title}
            fill
            className="object-cover"
          />
          
          {/* Mock Video Player Controls */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="text-white text-center space-y-3 md:space-y-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                    <div className="w-0 h-0 border-t-[8px] md:border-t-[10px] border-t-transparent border-l-[12px] md:border-l-[15px] border-l-white border-b-[8px] md:border-b-[10px] border-b-transparent ml-1" />
                </div>
                <p className="font-black text-lg md:text-xl tracking-tight">Buffering Stream...</p>
             </div>
          </div>

          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300",
            isUIActive ? "opacity-100" : "opacity-0"
          )} />
          
          {/* Header Overlay - Only visible when active */}
          <div className={cn(
            "absolute top-4 left-4 right-4 md:top-8 md:left-8 md:right-8 flex items-center justify-between pointer-events-none transition-opacity duration-300 z-[60]",
            isUIActive ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex items-center gap-2 md:gap-4 pointer-events-auto">
              <div className="bg-red-500 text-white text-[8px] md:text-[10px] font-black px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-white rounded-full animate-pulse" />
                Live
              </div>
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold text-white flex items-center gap-1.5 md:gap-2">
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5" />
                {stream.viewers.toLocaleString()}
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 pointer-events-auto">
              <button className="bg-white/10 hover:bg-white/20 p-1.5 md:p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all text-white">
                <Share2 className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 p-1.5 md:p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all text-white">
                <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button 
                onClick={onClose}
                className="bg-white/10 hover:bg-red-500 p-1.5 md:p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all text-white group"
              >
                <X className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </div>

          {/* Bottom Overlay - Only visible when active */}
          <div className={cn(
            "absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex items-end justify-between z-[60] pointer-events-none transition-opacity duration-300",
            isUIActive ? "opacity-100" : "opacity-0"
          )}>
            <div className="max-w-[70%] md:max-w-xl pointer-events-auto">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                <div className="relative w-8 h-8 md:w-12 md:h-12">
                  <Image 
                    src={stream.userImage} 
                    alt={stream.userName}
                    fill
                    className="rounded-full object-cover border-2 border-red-500"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-white text-base md:text-2xl tracking-tight leading-tight truncate">{stream.title}</h2>
                  <p className="text-white/60 text-[10px] md:text-[14px] font-medium">@{stream.userName}</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                const newState = !isMaximized;
                setIsMaximized(newState);
                
                // Toggle Browser Fullscreen
                if (newState) {
                   document.documentElement.requestFullscreen().catch((e) => {
                     console.error("Error attempting to enable fullscreen:", e);
                   });
                } else {
                   if (document.fullscreenElement) {
                     document.exitFullscreen().catch((e) => {
                       console.error("Error attempting to exit fullscreen:", e);
                     });
                   }
                }
              }}
              className="bg-white/10 hover:bg-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl backdrop-blur-xl border border-white/10 transition-all text-white pointer-events-auto"
            >
              {isMaximized ? (
                <Minimize2 className="w-4 h-4 md:w-6 md:h-6" />
              ) : (
                 <Maximize2 className="w-4 h-4 md:w-6 md:h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className={cn(
        "transition-all duration-300 z-50",
        isMaximized 
          ? "absolute bottom-4 left-4 md:left-4 right-4 md:right-auto md:w-[350px] h-[300px] md:h-[400px]" // Fullscreen on Left
          : "relative w-full md:w-[350px] h-full border-l border-white/10 bg-black" // Theater-by-Side Right
      )}>
        <LiveChat initialComments={stream.comments} overlayMode={isMaximized} />
      </div>

    </div>
  )
}
