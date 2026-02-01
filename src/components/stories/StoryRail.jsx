"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { StoryViewer } from "./StoryViewer"
import { useSession } from "next-auth/react"

export function StoryRail({ stories }) {
  const { data: session } = useSession()
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full border-b border-gray-200 dark:border-gray-800 bg-background/95 p-4 h-[100px]" />
    )
  }

  // Check if current user has a story
  const userHasStory = stories.some(story => story.authorId === session?.user?.id)

  // Group by user to show one bubble per user with stories
  const uniqueStories = stories.reduce((acc, story) => {
    if (!acc.find((s) => s.authorId === story.authorId)) {
        acc.push(story)
    }
    return acc
  }, [])

  // Sort unique stories: current user first, then others by date
  const sortedStories = uniqueStories.sort((a, b) => {
    if (a.authorId === session?.user?.id) return -1
    if (b.authorId === session?.user?.id) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <>
      <div className="w-full border-b border-gray-200 dark:border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex gap-4 overflow-x-auto p-4 no-scrollbar">
          {/* Show "Your Story" placeholder if user has no story */}
          {!userHasStory && session?.user && (
            <a
              href="/create"
              className="flex flex-col items-center gap-1 min-w-[70px] group"
            >
              <div className="relative w-[68px] h-[68px] rounded-full p-[2px] border-2 border-gray-300 dark:border-gray-600">
                <div className="w-full h-full rounded-full border-2 border-background overflow-hidden relative bg-gray-200/50 flex items-center justify-center">
                  <Image 
                    src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.name}`} 
                    alt="Your profile" 
                    width={68}
                    height={68}
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-2xl font-light">+</span>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-500 truncate w-full text-center">
                Your Story
              </span>
            </a>
          )}
          
          {sortedStories.map((story) => {
            const index = stories.findIndex(s => s.id === story.id)
            return (
              <div 
                key={story.id} 
                className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group"
                onClick={() => setSelectedStoryIndex(index)}
              >
                <div className={`relative w-[68px] h-[68px] rounded-full p-[2px] border-2 ${story.authorId === session?.user?.id ? 'border-gray-300 dark:border-gray-600' : 'border-primary'}`}>
                  <div className="w-full h-full rounded-full border-2 border-background overflow-hidden relative bg-gray-200/50">
                    <Image 
                        src={story.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.author.name}`} 
                        alt={story.author.name || "user"} 
                        width={68}
                        height={68}
                        className="object-cover transition-transform group-hover:scale-110" 
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-500 truncate w-full text-center">
                  {story.authorId === session?.user?.id ? "Your Story" : (story.author.name?.split(' ')[0] || "User")}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {selectedStoryIndex !== null && (
        <StoryViewer 
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setSelectedStoryIndex(null)}
          currentUserId={session?.user?.id}
        />
      )}
    </>
  )
}
