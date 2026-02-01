"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, X } from "lucide-react"
import { PostGridItem } from "./PostGridItem"
import { PostCard } from "./PostCard"
import { cn } from "@/lib/utils"


export function ProfileGallery({ posts, tab }) {
  const [selectedIndex, setSelectedIndex] = useState(null)

  return (
    <>
      <div className="grid grid-cols-3 gap-1 px-1 md:px-0">
        {posts.map((post, index) => (
          <PostGridItem 
            key={post.id} 
            post={post} 
            aspectRatio={tab === "reels" ? "video" : "square"}
            isProfileView={true}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedIndex !== null && (
          <PostStackModal 
            posts={posts} 
            initialIndex={selectedIndex} 
            onClose={() => setSelectedIndex(null)} 
          />
        )}
      </AnimatePresence>
    </>
  )
}

function PostStackModal({ posts, initialIndex, onClose }) {
  const containerRef = useRef(null)

  useEffect(() => {
    // Prevent background scrolling
    document.body.style.overflow = "hidden"
    
    // Scroll to the selected post initially
    if (containerRef.current) {
        const wrapper = containerRef.current.firstElementChild
        const target = wrapper?.children[initialIndex]
        if (target) {
            containerRef.current.scrollTop = target.offsetTop
        }
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [initialIndex])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-[150] flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-20 px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-bold">Posts</h2>
        </div>
        <button onClick={onClose} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
           <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Stack */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto scroll-smooth snap-y snap-proximity"
      >
        <div className="max-w-2xl mx-auto py-4 space-y-4">
            {posts.map((post) => (
                <div key={post.id} className="snap-start scroll-mt-20">
                    <PostCard {...post} isProfileView={true} />
                </div>
            ))}
        </div>
      </div>
    </motion.div>
  )
}
