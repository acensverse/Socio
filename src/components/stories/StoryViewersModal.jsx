"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getStoryViewers } from "@/actions/story"

export function StoryViewersModal({ storyId, onClose }) {
  const [viewers, setViewers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchViewers() {
      try {
        const data = await getStoryViewers(storyId)
        setViewers(data)
      } catch (error) {
        console.error("Failed to fetch viewers:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchViewers()
  }, [storyId])

  const formatTime = (date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div 
        className="bg-background rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-bold">Viewers</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : viewers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="text-sm">No views yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {viewers.map((viewer) => (
                <Link
                  key={viewer.id}
                  href={`/profile/${viewer.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  onClick={onClose}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={viewer.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${viewer.email}`}
                      alt={viewer.name || "User"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{viewer.name || "User"}</p>
                    <p className="text-sm text-gray-500">{formatTime(viewer.viewedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
