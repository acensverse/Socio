"use client"

import { useState } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { MediaUploader } from "../upload/MediaUploader"
import { uploadMedia } from "@/actions/upload"
import { createPost } from "@/actions/post"
import { Image as ImageIcon, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function CreatePost() {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!session) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !selectedFile) return
    setLoading(true)

    try {
      if (selectedFile) {
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("content", content)
        const result = await uploadMedia(formData, "post")
        if (!result.success) throw new Error(result.error)
      } else {
        const formData = new FormData()
        formData.append("content", content)
        await createPost(formData)
      }

      setContent("")
      setSelectedFile(null)
      setShowUpload(false)
    } catch (error) {
      console.error(error)
      alert("Failed to post")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-900 mb-8 transition-all duration-300">
      <form onSubmit={handleSubmit}>
        {/* User Info Header */}
        <div className="flex items-center gap-3 mb-4">
          <Image 
            src={session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`} 
            alt="Avatar" 
            width={40}
            height={40}
            className="rounded-full ring-2 ring-gray-50 dark:ring-zinc-900" 
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm">{session.user?.name || "User"}</span>
            <span className="text-xs text-gray-500">@{session.user?.email?.split("@")[0]}</span>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full bg-transparent border-none focus:ring-0 resize-none text-[16px] placeholder-gray-500 mb-2 min-h-[80px]"
        />

        {showUpload && (
            <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-dashed border-gray-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-300">
               <MediaUploader 
                   onFileSelect={(file) => {
                       setSelectedFile(file)
                   }}
                />
            </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-900">
           <div className="flex gap-1">
              <button 
                type="button" 
                onClick={() => setShowUpload(!showUpload)} 
                className={cn(
                  "p-2.5 rounded-full transition-all duration-200",
                  showUpload ? "bg-primary/10 text-primary" : "hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500"
                )}
              >
                 <ImageIcon className="w-5 h-5" />
              </button>
           </div>
           
           <button 
            type="submit" 
            disabled={(!content.trim() && !selectedFile) || loading}
            className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90 transition-all duration-200 disabled:opacity-40 disabled:grayscale flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{loading ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
