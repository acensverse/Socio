"use client"

import { useState } from "react"
import { Heart, MessageCircle, Repeat, Share, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toggleLike } from "@/actions/post"
import { ShareModal } from "@/components/shared/ShareModal"

export function ActionButtons({ postId, likes, comments, reposts, views, isLikedInitially, onCommentClick }) {
  const [isLiked, setIsLiked] = useState(isLikedInitially)
  const [likeCount, setLikeCount] = useState(likes)
  const [showShare, setShowShare] = useState(false)

  const handleLike = async (e) => {
    e.stopPropagation()
    // Optimistic update
    setIsLiked(!isLiked)
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
    
    try {
      await toggleLike(postId)
    } catch (error) {
      // Revert if error
      setIsLiked(isLiked)
      setLikeCount(likeCount)
      console.error(error)
    }
  }

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-gray-500">
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onCommentClick?.()
          }}
          className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
          aria-label="Comment"
        >
          <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <MessageCircle className="w-5 h-5" />
          </div>
          <span className="text-sm">{comments}</span>
        </button>

        <button 
          className="flex items-center gap-2 hover:text-green-500 transition-colors group"
          aria-label="Repost"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 rounded-full group-hover:bg-green-500/10 transition-colors">
              <Repeat className="w-5 h-5" />
          </div>
          <span className="text-sm">{reposts}</span>
        </button>

        <button 
          onClick={handleLike}
          className={cn("flex items-center gap-2 hover:text-pink-500 transition-colors group", isLiked && "text-pink-500")}
          aria-label="Like"
        >
          <div className="p-2 rounded-full group-hover:bg-pink-500/10 transition-colors">
              <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </div>
          <span className="text-sm">{likeCount}</span>
        </button>

        <button 
          className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
          aria-label="View"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-sm">{views}</span>
        </button>
        
        <button 
          className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
          aria-label="Share"
          onClick={(e) => {
            e.stopPropagation()
            setShowShare(true)
          }}
        >
          <div className="p-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
              <Share className="w-5 h-5" />
          </div>
        </button>
      </div>

      <ShareModal 
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url={`/post/${postId}`}
        title="Check out this post"
      />
    </div>
  )
}
