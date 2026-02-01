"use client"

import { useState, useRef } from "react"
import { Smile, Mic, Image as ImageIcon, Heart, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { EmojiPicker } from "../common/EmojiPicker"
import { AnimatePresence } from "framer-motion"

export function MessageInput({ onSend, disabled }) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if ((!content.trim() && !selectedFile) || sending || disabled) return

    setSending(true)
    try {
      let formData
      if (selectedFile) {
        formData = new FormData()
        formData.append("file", selectedFile)
      }
      await onSend(content, formData)
      setContent("")
      clearFile()
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="p-4 bg-background">
      {/* Preview */}
      {previewUrl && (
        <div className="mb-3 relative inline-block">
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
            {selectedFile?.type.startsWith('video') ? (
              <video src={previewUrl} className="w-full h-full object-cover" />
            ) : (
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
            )}
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full p-1 hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative flex items-center gap-3 bg-gray-100 dark:bg-zinc-800 border-transparent dark:border-zinc-700 border rounded-[30px] px-4 py-2 min-h-[44px]">
        <div className="relative">
            <button 
                type="button" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 hover:opacity-70 transition-opacity"
            >
                <Smile className="w-6 h-6 text-foreground" />
            </button>
            <AnimatePresence>
                {showEmojiPicker && (
                    <EmojiPicker 
                        onEmojiSelect={handleEmojiSelect} 
                        onClose={() => setShowEmojiPicker(false)} 
                    />
                )}
            </AnimatePresence>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          disabled={disabled || sending}
          rows={1}
          className="flex-1 bg-transparent resize-none text-[15px] py-1.5 focus:outline-none max-h-32 disabled:opacity-50"
          onInput={(e) => {
            const target = e.target
            target.style.height = "auto"
            target.style.height = Math.min(target.scrollHeight, 128) + "px"
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center gap-1">
          {content.trim() || selectedFile ? (
            <button
              type="submit"
              disabled={sending || disabled}
              className="px-4 py-2 text-primary font-bold text-sm hover:opacity-80 transition-opacity"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          ) : (
            <>
                <button type="button" className="p-2 hover:opacity-70 transition-opacity">
                    <Mic className="w-6 h-6 text-foreground" />
                </button>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:opacity-70 transition-opacity"
                >
                    <ImageIcon className="w-6 h-6 text-foreground" />
                </button>
                <button type="button" className="p-2 hover:opacity-70 transition-opacity">
                    <Heart className="w-6 h-6 text-foreground" />
                </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
