"use client"

import { useState } from "react"
import { Image as ImageIcon, X, Film, PlusCircle, Radio, Camera, Zap, RotateCcw } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { uploadMedia } from "@/actions/upload"
import { useSession } from "next-auth/react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { EmojiPicker } from "@/components/common/EmojiPicker"
import { AnimatePresence } from "framer-motion"
import { Smile } from "lucide-react"

export default function CreatePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [activeType, setActiveType] = useState("post")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [caption, setCaption] = useState("")
  const [loading, setLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      const url = URL.createObjectURL(selectedFile)
      setPreview(url)
    }
  }

  const handlePost = async () => {
    if (!file && activeType !== "post") return
    if (!file && activeType === "post" && !caption.trim()) return
    
    setLoading(true)

    try {
      const formData = new FormData()
      if (file) formData.append("file", file)
      formData.append("content", caption)

      if (activeType === "post") {
        if (file) {
          const result = await uploadMedia(formData, "post")
          if (!result.success) throw new Error(result.error)
        } else {
          const { createPost } = await import("@/actions/post")
          await createPost(formData)
        }
        router.push("/")
      } else if (activeType === "story") {
        if (!file) throw new Error("File required for story")
        const result = await uploadMedia(formData, "story")
        if (!result.success) throw new Error(result.error)
        router.push("/")
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to share")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeType === "live") {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [activeType])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true 
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Camera error:", err)
      // Only alert if we're actually trying to be in live mode
      if (activeType === 'live') {
        alert("Please allow camera access to go live")
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
  }

  const handleGoLive = () => {
    setIsStreaming(true)
    // Here we would normally start the RTMP/WebRTC broadcast
  }

  const types = [
    { id: "post", label: "Post", icon: PlusCircle },
    { id: "story", label: "Story", icon: Film },
    { id: "live", label: "Live", icon: Radio },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-xl mx-auto bg-white dark:bg-black md:border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
               <X className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold flex-1 text-center">Create New {activeType.charAt(0).toUpperCase() + activeType.slice(1)}</h1>
            {activeType === 'live' ? (
              <button 
                onClick={handleGoLive}
                disabled={loading || isStreaming}
                className={cn(
                    "font-bold transition-all px-6 py-1.5 rounded-full shadow-lg",
                    isStreaming ? "bg-red-500 text-white animate-pulse" : "bg-primary text-black hover:bg-blue-600 hover:text-white"
                )}
              >
                {isStreaming ? "LIVE" : "Go Live"}
              </button>
            ) : (
              <button 
                onClick={handlePost}
                disabled={(!file && (activeType !== "post" || !caption.trim())) || loading}
                className="text-primary font-bold disabled:opacity-50 hover:text-blue-600 transition-colors px-4 py-1"
              >
                {loading ? "Sharing..." : "Share"}
              </button>
            )}
        </div>

        {/* Type Selector */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
            {types.map((t) => (
                <button
                    key={t.id}
                    onClick={() => {
                        setActiveType(t.id)
                        setFile(null)
                        setPreview(null)
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors relative ${activeType === t.id ? "text-primary" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                    {activeType === t.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />}
                </button>
            ))}
        </div>

        <div className="p-6 flex flex-col gap-8 flex-1">
            {/* Image Preview / Drop Area */}
            <div className={cn(
                "w-full bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center relative overflow-hidden group shadow-inner transition-all duration-300",
                activeType === 'story' || activeType === 'live' ? 'aspect-[9/16] max-h-[700px]' : 'aspect-square'
            )}>
                {activeType === 'live' ? (
                    <div className="w-full h-full relative bg-black">
                        <video 
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover mirror"
                        />
                        
                        {/* Camera Overlays */}
                        <div className="absolute inset-x-0 top-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <div className={cn("w-2 h-2 rounded-full", isStreaming ? "bg-red-500 animate-pulse" : "bg-gray-400")} />
                                    <span className="text-white text-[10px] font-black uppercase tracking-widest">
                                        {isStreaming ? "Streaming" : "Preview"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 pointer-events-auto">
                                <button className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-all">
                                    <Zap className="w-5 h-5" />
                                </button>
                                <button className="p-3 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-black/60 transition-all">
                                    <RotateCcw className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Bottom Stats Overlay (Conditional) */}
                        {isStreaming && (
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="flex flex-col">
                                        <span className="text-white font-bold text-sm tracking-tight">{session?.user?.name} is LIVE</span>
                                        <span className="text-white/60 text-xs font-medium">0 Viewers</span>
                                     </div>
                                </div>
                            </div>
                        )}

                        {!isStreaming && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="bg-black/20 backdrop-blur-sm p-8 rounded-full border border-white/10 mb-4 animate-in zoom-in duration-500">
                                    <Camera className="w-12 h-12 text-white opacity-80" />
                                </div>
                                <p className="text-white/80 font-bold text-lg drop-shadow-lg">Camera Ready</p>
                            </div>
                        )}
                    </div>
                ) : preview ? (
                   <>
                      {file?.type.startsWith('video') ? (
                          <video 
                            src={preview} 
                            controls 
                            className={`w-full h-full object-contain ${activeType === 'story' ? 'aspect-[9/16]' : ''}`}
                          />
                      ) : (
                          <div className={`relative w-full h-full ${activeType === 'story' ? 'aspect-[9/16]' : ''}`}>
                            <Image 
                                src={preview} 
                                alt="Preview" 
                                fill
                                className="object-contain" 
                            />
                          </div>
                      )}
                      <button 
                        onClick={() => { setFile(null); setPreview(null); }}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all z-10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                   </>
                ) : (
                   <label className="cursor-pointer flex flex-col items-center gap-4 text-gray-500 hover:text-primary transition-all p-10 text-center w-full h-full justify-center">
                      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">Select Media</p>
                        <p className="text-sm opacity-60">{activeType === 'story' ? '9:16 Video or Image' : 'Photos or Videos'} up to 10MB</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                   </label>
                )}
            </div>

            {/* Caption Input - Only for Posts */}
            {activeType === "post" && (
                <div className="flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-800">
                      <Image 
                        src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || 'User'}`} 
                        alt="User" 
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                   </div>
                   <div className="flex-1 flex flex-col relative">
                     <textarea 
                       placeholder="Write a caption..." 
                       className="w-full bg-transparent resize-none outline-none min-h-[120px] text-lg leading-relaxed placeholder:text-gray-400"
                       value={caption}
                       onChange={(e) => setCaption(e.target.value)}
                     />
                     <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-zinc-900/50">
                        <div className="relative">
                            <button 
                                type="button" 
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2 -ml-15 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all text-gray-400 hover:text-primary active:scale-95"
                            >
                                <Smile className="w-6 h-6" />
                            </button>
                            <AnimatePresence mode="wait">
                                {showEmojiPicker && (
                                    <div className="absolute bottom-full mb-3 left-0 z-50">
                                        <EmojiPicker 
                                            onEmojiSelect={(emoji) => setCaption(prev => prev + emoji)} 
                                            onClose={() => setShowEmojiPicker(false)} 
                                        />
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className={cn(
                            "text-[10px] font-black tracking-widest uppercase",
                            caption.length > 2000 ? "text-red-500" : "text-gray-300"
                        )}>
                            {caption.length} / 2200
                        </span>
                     </div>
                   </div>
                </div>
            )}

            {activeType === "story" && (
                <div className="text-center text-gray-500 text-sm animate-in fade-in duration-300">
                    Stories vanish after 24 hours.
                </div>
            )}

            {activeType === "live" && (
                <div className="text-center text-gray-500 text-sm animate-in fade-in duration-300">
                    Interact with your audience in real-time. Connect and build your community.
                </div>
            )}
        </div>

      </div>
    </div>
  )
}
