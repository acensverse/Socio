"use client"

import { useState } from "react"
import { Heart, MessageCircle, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CommentModal } from "./CommentModal"
import { PostCard } from "./PostCard"


export function PostGridItem({ post, aspectRatio = "square", isProfileView = false, onClick }) {
  const [showDetailModal, setShowDetailModal] = useState(false)

  return (
    <>
      <div 
        onClick={() => onClick ? onClick() : setShowDetailModal(true)}
        className={cn(
          "relative bg-gray-100 dark:bg-zinc-900 group overflow-hidden cursor-pointer",
          aspectRatio === "video" ? "aspect-[9/16]" : "aspect-square"
        )}
      >
        {post.mediaType === "video" ? (
          <video src={post.image} className="w-full h-full object-cover" />
        ) : (
          <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
           <div className="flex items-center gap-1"><Heart className="w-5 h-5 fill-white" /> {post.stats.likes}</div>
           <div className="flex items-center gap-1"><MessageCircle className="w-5 h-5 fill-white" /> {post.stats.comments}</div>
        </div>
      </div>

      {showDetailModal && (
        <PostDetailModal 
          post={post}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </>
  )
}

function PostDetailModal({ post, onClose }) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center pointer-events-auto md:p-10" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="bg-background w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-xl overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background/80 backdrop-blur z-20 px-4 py-3 flex items-center gap-4 border-b border-gray-100 dark:border-zinc-800">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold">Post</h2>
        </div>
        <div className="bg-background">
          <PostCard {...post} isProfileView={true} />
        </div>
      </motion.div>
    </div>
  )
}
