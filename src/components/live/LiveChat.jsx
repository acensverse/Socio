"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Send, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import { LiveComment } from "./mockData"


const NICKNAMES = ["TechFan", "WebWiz", "CodeMaster", "PixelArtist", "DevLife", "GrowthMind"];
const MESSAGES = [
  "This is amazing",
  "Great tips ❤️",
  "Can you show that again?",
  "Love the vibes here ✨",
  "Hello from Tokyo 🇯🇵",
  "Wait, how did you do that?",
  "Insane skills 🔥🔥🔥",
  "LFG!!!",
  "Subscribed 👍",
  "Nice work dude",
];

export function LiveChat({ initialComments, overlayMode = false }) {
  const [comments, setComments] = useState(initialComments);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const newComment = {
        id: Math.random().toString(),
        userName: NICKNAMES[Math.floor(Math.random() * NICKNAMES.length)],
        userImage: `https://i.pravatar.cc/100?u=${Math.random()}`,
        text: MESSAGES[Math.floor(Math.random() * MESSAGES.length)],
        timestamp: new Date(),
      };
      setComments(prev => [...prev.slice(-49), newComment]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const myComment = {
      id: Math.random().toString(),
      userName: "You",
      userImage: "https://i.pravatar.cc/100?u=me",
      text: input,
      timestamp: new Date(),
    };

    setComments(prev => [...prev, myComment]);
    setInput("");
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      overlayMode ? "bg-transparent" : "bg-black/40 backdrop-blur-xl border-l border-white/10"
    )}>
      {!overlayMode && (
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/50">Live Chat</h3>
        </div>
      )}

      <div 
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto space-y-4 no-scrollbar",
          overlayMode ? "p-4 mask-image-b-0 mask-image-t-full [mask-image:linear-gradient(to_bottom,transparent,black_20%)]" : "p-4"
        )}
      >
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="relative w-8 h-8 shrink-0">
              <Image 
                src={comment.userImage} 
                alt={comment.userName}
                fill
                className="rounded-full object-cover border border-white/10"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white/90">{comment.userName}</span>
                <span className="text-[10px] text-white/40">{comment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mt-0.5 break-words">
                {comment.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        overlayMode ? "p-4 bg-transparent" : "p-4 bg-white/5 border-t border-white/10"
      )}>
        <form onSubmit={handleSend} className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={overlayMode ? "Comment..." : "Say something..."}
            className={cn(
              "w-full rounded-2xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none transition-all",
              overlayMode 
                ? "bg-black/20 border-transparent placeholder:text-white/50 focus:bg-black/40" 
                : "bg-white/10 border border-white/10 placeholder:text-white/30 focus:ring-2 focus:ring-red-500/50"
            )}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-red-500 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-2">
                {["❤️", "🔥", "🙌", "✨", "💯"].map(emoji => (
                    <button 
                        key={emoji}
                        type="button"
                        onClick={() => setInput(prev => prev + emoji)}
                        className="text-lg hover:scale-125 transition-transform"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
            <button className="text-white/40 hover:text-red-500 transition-all">
                <Heart className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  )
}
