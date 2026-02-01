"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronLeft, ChevronRight, Trash2, Eye, Send } from "lucide-react"
import Image from "next/image"
import { deleteStory, viewStory } from "@/actions/story"
import { StoryViewersModal } from "./StoryViewersModal"

export function StoryViewer({ stories, initialIndex, onClose, currentUserId }) {
  const [index, setIndex] = useState(initialIndex)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const [replyText, setReplyText] = useState("")
  const currentStory = stories[index]
  const isOwner = currentUserId === currentStory.authorId

  const handleNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex(index + 1)
    } else {
      onClose()
    }
  }, [index, stories.length, onClose])

  const handlePrev = useCallback(() => {
    if (index > 0) {
      setIndex(index - 1)
    }
  }, [index])

  useEffect(() => {
    if (currentStory) {
      viewStory(currentStory.id)
    }
  }, [currentStory])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleNext, handlePrev, onClose])

  const handleDelete = async () => {
      if (!confirm("Delete this story?")) return
      setIsDeleting(true)
      try {
          await deleteStory(currentStory.id)
          handleNext()
      } catch (error) {
          console.error(error)
          alert("Failed to delete story")
      } finally {
          setIsDeleting(false)
      }
  }

  const isVideo = currentStory.mediaUrl.match(/\.(mp4|webm|ogg)$/) || currentStory.mediaUrl.includes('video/upload')

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-0 md:p-4">
      {/* Background Blur */}
      <div className="absolute inset-0 overflow-hidden">
        <Image 
          src={currentStory.mediaUrl} 
          alt="background" 
          fill 
          className="object-cover blur-3xl opacity-30 scale-110" 
        />
      </div>

      <div className="relative w-full max-w-[450px] aspect-[9/16] bg-black shadow-2xl overflow-hidden flex flex-col rounded-none md:rounded-2xl">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 bg-gradient-to-b from-black/40 to-transparent">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${i <= index ? "bg-white" : "w-0"}`} 
                style={{ width: i < index ? "100%" : i === index ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-4 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20">
              <Image 
                src={currentStory.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentStory.author.name}`} 
                alt="author" 
                width={40} 
                height={40} 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
                <span className="text-white font-bold text-sm drop-shadow-md">
                {currentStory.author.name}
                </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-white/80 hover:text-red-400 p-2 rounded-full hover:bg-black/20 transition-all"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
            )}
            <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-black/20 transition-all">
              <X className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Media */}
        <div className="flex-1 relative flex items-center justify-center">
          {isVideo ? (
            <video 
              src={currentStory.mediaUrl} 
              autoPlay 
              playsInline
              onEnded={handleNext}
              className="w-full h-full object-contain"
            />
          ) : (
            <Image 
              src={currentStory.mediaUrl} 
              alt="story" 
              fill 
              priority
              className="object-contain"
            />
          )}

          {/* Touch zones */}
          <div className="absolute inset-0 flex">
            <div className="flex-1 h-full cursor-pointer" onClick={handlePrev} />
            <div className="flex-1 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* View count - bottom left (clickable for owner) */}
          {isOwner && (
            <button 
              onClick={() => setShowViewers(true)}
              className="absolute bottom-4 left-4 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-black/60 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{currentStory._count?.views || 0}</span>
            </button>
          )}

        </div>

        {/* Reply input - bottom (for non-owners) - Outside media container for better visibility */}
        {!isOwner && currentUserId && (
          <div className="absolute bottom-4 left-4 right-4 z-30">
            <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full px-4 py-3 border border-white/30 shadow-lg">
              <input
                type="text"
                placeholder={`Reply to ${currentStory.author.name || 'user'}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder-white/70 outline-none text-sm"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && replyText.trim()) {
                    // TODO reply
                    alert(`Reply sent to ${currentStory.author.name}: ${replyText}`)
                    setReplyText("")
                  }
                }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (replyText.trim()) {
                    // TODO reply
                    alert(`Reply sent to ${currentStory.author.name}: ${replyText}`)
                    setReplyText("")
                  }
                }}
                disabled={!replyText.trim()}
                className="text-white disabled:opacity-40 hover:scale-110 transition-transform"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons (Desktop only) */}
        <div className="hidden md:block">
            {index > 0 && (
                <button 
                    onClick={handlePrev}
                    className="absolute left-[-60px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                >
                    <ChevronLeft className="w-8 h-8" />
                </button>
            )}
            <button 
                onClick={handleNext}
                className="absolute right-[-60px] top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
            >
                <ChevronRight className="w-8 h-8" />
            </button>
        </div>
      </div>

      {/* Viewers Modal */}
      {showViewers && (
        <StoryViewersModal 
          storyId={currentStory.id}
          onClose={() => setShowViewers(false)}
        />
      )}
    </div>
  )
}
