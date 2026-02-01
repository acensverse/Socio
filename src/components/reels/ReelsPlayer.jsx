"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Heart,
  MessageCircle,
  ArrowLeft,
  Volume2,
  VolumeX,
  Share as ShareIcon,
  Play,
  Repeat,
  Bookmark,
  Pencil,
  Trash2,
  MoreVertical,
  ThumbsDown
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toggleLike, deletePost, editPost } from "@/actions/post"
import { ShareModal } from "@/components/shared/ShareModal"
import { ReelsCommentSidebar } from "./ReelsCommentSidebar"
import { useRouter } from "next/navigation"

export function ReelsPlayer({ reels, currentUserId }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [showMenuId, setShowMenuId] = useState(null)
  const [editingReelId, setEditingReelId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [videoProgress, setVideoProgress] = useState({})

  const router = useRouter()

  const containerRef = useRef(null)
  const videoRefs = useRef([])

  const [likeStates, setLikeStates] = useState(
    reels.reduce((acc, reel) => {
      acc[reel.id] = { isLiked: reel.isLiked, count: parseInt(reel.likes) }
      return acc
    }, {})
  )

  const currentReel = reels[currentIndex]

  // Sync mute with active video
  useEffect(() => {
    const video = videoRefs.current[currentIndex]
    if (video) {
      video.muted = isMuted
      if (!isMuted) video.volume = 1
    }
  }, [isMuted, currentIndex])

  // Auto play / pause on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const video = entry.target
          const index = videoRefs.current.indexOf(video)

          if (entry.isIntersecting) {
            setCurrentIndex(index)
            video.play().catch(() => {})
            setIsPaused(false)
          } else {
            video.pause()
          }
        })
      },
      { root: containerRef.current, threshold: 0.5 }
    )

    videoRefs.current.forEach(v => v && observer.observe(v))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.style.overflow = showCommentModal ? "hidden" : "auto"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [showCommentModal])


  const togglePlay = (index) => {
    const video = videoRefs.current[index]
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPaused(false)
    } else {
      video.pause()
      setIsPaused(true)
    }
  }

  const handleTimeUpdate = (id, e) => {
    const video = e.currentTarget
    setVideoProgress(prev => ({
      ...prev,
      [id]: { currentTime: video.currentTime, duration: video.duration }
    }))
  }

  const handleSeek = (id, index, value) => {
    const video = videoRefs.current[index]
    if (video) {
      video.currentTime = value
      setVideoProgress(prev => ({
        ...prev,
        [id]: { ...prev[id], currentTime: value }
      }))
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleLike = async () => {
    const prev = likeStates[currentReel.id]

    setLikeStates(s => ({
      ...s,
      [currentReel.id]: {
        isLiked: !prev.isLiked,
        count: prev.isLiked ? prev.count - 1 : prev.count + 1
      }
    }))

    try {
      await toggleLike(currentReel.id)
    } catch {
      setLikeStates(s => ({ ...s, [currentReel.id]: prev }))
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm("Are you sure you want to delete this reel?")) return
    try {
      await deletePost(postId)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete reel")
    }
  }

  const handleEditReel = async (id) => {
    if (!editValue.trim()) return
    try {
      await editPost(id, editValue)
      setEditingReelId(null)
      setEditValue("")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to edit reel")
    }
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white dark:bg-black relative z-[60]">
      {/* MAIN VIDEO COLUMN - Shifts via padding on desktop */}
      <div
        ref={containerRef}
        className={cn(
          "h-full w-full overflow-y-auto snap-y snap-mandatory overflow-x-hidden [&::-webkit-scrollbar]:hidden transition-all duration-500 ease-in-out",
        )}
        style={{ scrollbarWidth: "none" }}
      >
        {reels.map((reel, index) => {
          const likeState = likeStates[reel.id]
          const isAuthor = currentUserId === reel.author.id
          const isCurrent = index === currentIndex

          return (
            <div
              key={reel.id}
              className="h-[100dvh] md:h-screen w-full snap-start flex bg-white dark:bg-black relative overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex flex-row w-full h-full relative">
                <div className="flex-1 h-full relative flex items-center justify-center transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-end md:gap-6 w-full md:w-auto h-full md:h-auto items-center justify-center">
                    <div
                      className={cn(
                        "relative flex-shrink-0 bg-black md:bg-zinc-900 overflow-hidden min-w-0 transition-all duration-500",
                        "w-full h-full md:h-[85vh] md:w-auto md:aspect-[9/16]",
                        "rounded-none md:rounded-[32px]",
                        "md:shadow-2xl md:border md:border-gray-100 dark:md:border-zinc-800"
                      )}
                    >
                      <video
                        ref={(el) => {
                          videoRefs.current[index] = el
                        }}
                        src={reel.url}
                        className="h-full w-full object-cover cursor-pointer"
                        loop
                        muted={isMuted}
                        playsInline
                        onTimeUpdate={(e) => handleTimeUpdate(reel.id, e)}
                        onLoadedMetadata={(e) => handleTimeUpdate(reel.id, e)}
                        onClick={() => togglePlay(index)}
                      />

                      <div className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-2 md:px-8 md:pb-4 group/seekbar">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] md:text-xs text-white font-medium drop-shadow-md tabular-nums opacity-0 group-hover/seekbar:opacity-100 transition-opacity">
                            {formatTime(videoProgress[reel.id]?.currentTime || 0)}
                          </span>
                          <div className="relative flex-1 h-1.5 md:h-2 flex items-center group cursor-pointer">
                            <input
                              type="range"
                              min={0}
                              max={videoProgress[reel.id]?.duration || 100}
                              step={0.1}
                              value={videoProgress[reel.id]?.currentTime || 0}
                              onChange={(e) => handleSeek(reel.id, index, parseFloat(e.target.value))}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute inset-0 w-full h-full appearance-none bg-white/20 rounded-full cursor-pointer z-10 accent-white [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0"
                            />
                            <div
                              className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-all duration-75"
                              style={{
                                width: `${((videoProgress[reel.id]?.currentTime || 0) / (videoProgress[reel.id]?.duration || 1)) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-[10px] md:text-xs text-white font-medium drop-shadow-md tabular-nums opacity-0 group-hover/seekbar:opacity-100 transition-opacity">
                            {formatTime(videoProgress[reel.id]?.duration || 0)}
                          </span>
                        </div>
                      </div>

                      <Link
                        href="/"
                        className="absolute top-4 left-4 md:top-6 md:left-6 p-2.5 md:p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full z-20 transition-all border border-white/10 group"
                      >
                        <ArrowLeft className="text-white w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsMuted(!isMuted)
                        }}
                        className="absolute top-4 right-4 md:top-6 md:right-6 p-2.5 md:p-3 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full z-20 transition-all border border-white/10"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                      </button>

                      <div className="absolute bottom-6 left-6 right-16 md:bottom-10 md:left-8 md:right-24 text-white z-10 pointer-events-none flex flex-col gap-3 md:gap-4">
                        <Link href={`/profile/${reel.author.id}`} className="mb-1 md:mb-2 pointer-events-auto w-fit">
                          <img
                            src={reel.author.avatar}
                            alt={reel.author.name}
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white object-cover shadow-lg hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="flex flex-col">
                          <h2 className="text-lg md:text-2xl font-black mb-0.5 md:mb-1 drop-shadow-lg tracking-tight">{reel.description.split('\n')[0]}</h2>
                          {editingReelId === reel.id ? (
                            <div className="pointer-events-auto bg-black/40 backdrop-blur-sm p-4 rounded-2xl border border-white/10 max-w-sm">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-transparent text-sm text-white border-none outline-none resize-none"
                                rows={3}
                                autoFocus
                              />
                              <div className="flex justify-end gap-3 mt-3">
                                <button onClick={() => setEditingReelId(null)} className="px-4 py-2 text-xs font-bold text-gray-400">Cancel</button>
                                <button onClick={() => handleEditReel(reel.id)} className="px-4 py-2 text-xs font-bold text-white bg-blue-500 rounded-full">Save</button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm md:text-base font-medium drop-shadow-lg line-clamp-2 opacity-95">
                              {reel.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="absolute bottom-6 right-3 z-10 flex flex-col items-center gap-3 md:hidden">
                        <div className="flex flex-col items-center">
                          <button onClick={handleLike} className="group flex flex-col items-center">
                            <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full transition-all text-white border border-white/10">
                              <Heart
                                className={cn(
                                  "w-6 h-6",
                                  likeState.isLiked ? "fill-red-500 text-red-500" : ""
                                )}
                              />
                            </div>
                            <span className="text-[10.5px] mt-1 font-bold text-white drop-shadow-md">{likeState.count}K</span>
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <button className="group flex flex-col items-center">
                            <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full transition-all text-white border border-white/10">
                              <ThumbsDown className="w-6 h-6" />
                            </div>
                            <span className="text-[10.5px] mt-1 font-bold text-white drop-shadow-md">Dislike</span>
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <button onClick={() => setShowCommentModal(true)} className="group flex flex-col items-center">
                            <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full transition-all text-white border border-white/10">
                              <MessageCircle className="w-6 h-6" />
                            </div>
                            <span className="text-[10.5px] mt-1 font-bold text-white drop-shadow-md">{reel.commentsCount}</span>
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <button onClick={() => setShowShare(true)} className="group flex flex-col items-center">
                            <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full transition-all text-white border border-white/10">
                              <ShareIcon className="w-6 h-6" />
                            </div>
                          </button>
                        </div>

                        <div className="flex flex-col items-center">
                          <button className="group flex flex-col items-center">
                            <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full transition-all text-white border border-white/10">
                              <Repeat className="w-6 h-6" />
                            </div>
                          </button>
                        </div>

                        {isAuthor && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowMenuId(showMenuId === reel.id ? null : reel.id)
                              }}
                              className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-2.5 rounded-full transition-all text-white border border-white/10"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>

                            {showMenuId === reel.id && (
                              <div className="absolute right-full mr-4 bottom-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 py-2 min-w-[160px]">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingReelId(reel.id)
                                    setEditValue(reel.description)
                                    setShowMenuId(null)
                                  }}
                                  className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" /> Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(reel.id)
                                    setShowMenuId(null)
                                  }}
                                  className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isPaused && isCurrent && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                          <div className="bg-white/20 backdrop-blur-md p-6 rounded-full z-10 border border-white/20">
                            <Play className="w-12 h-12 text-white fill-white" />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="hidden md:flex flex-col items-center gap-4 flex-shrink-0">
                      <div className="flex flex-col items-center">
                        <button onClick={handleLike} className="group flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 rounded-full transition-all text-gray-900 dark:text-white">
                            <Heart
                              className={cn(
                                "w-7 h-7",
                                likeState.isLiked ? "fill-red-500 text-red-500" : ""
                              )}
                            />
                          </div>
                          <span className="text-[13px] mt-2 font-bold text-gray-600 dark:text-gray-400">{likeState.count}</span>
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <button className="group flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 rounded-full transition-all text-gray-900 dark:text-white">
                            <ThumbsDown className="w-7 h-7" />
                          </div>
                          <span className="text-[13px] mt-2 font-bold text-gray-600 dark:text-gray-400">Dislike</span>
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <button onClick={() => setShowCommentModal(true)} className="group flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 rounded-full transition-all text-gray-900 dark:text-white">
                            <MessageCircle className="w-7 h-7" />
                          </div>
                          <span className="text-[13px] mt-2 font-bold text-gray-600 dark:text-gray-400">{reel.commentsCount}</span>
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <button onClick={() => setShowShare(true)} className="group flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 rounded-full transition-all text-gray-900 dark:text-white">
                            <ShareIcon className="w-7 h-7" />
                          </div>
                        </button>
                      </div>

                      <div className="flex flex-col items-center">
                        <button className="group flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 rounded-full transition-all text-gray-900 dark:text-white">
                            <Repeat className="w-7 h-7" />
                          </div>
                        </button>
                      </div>

                      {isAuthor && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowMenuId(showMenuId === reel.id ? null : reel.id)
                            }}
                            className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 p-4 rounded-full transition-all text-gray-900 dark:text-white"
                          >
                            <MoreVertical className="w-6 h-6" />
                          </button>

                          {showMenuId === reel.id && (
                            <div className="absolute right-full mr-4 bottom-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 py-2 min-w-[160px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setEditingReelId(reel.id)
                                  setEditValue(reel.description)
                                  setShowMenuId(null)
                                }}
                                className="flex items-center gap-3 w-full px-5 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                              >
                                <Pencil className="w-4 h-4" /> Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(reel.id)
                                  setShowMenuId(null)
                                }}
                                className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="md:hidden">
        <AnimatePresence>
          {showCommentModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-[150] pointer-events-auto"
                onClick={() => setShowCommentModal(false)}
              />
              <div className="fixed inset-x-0 bottom-0 z-[160] pointer-events-none">
                <div className="pointer-events-auto">
                  <ReelsCommentSidebar
                    key={currentReel?.id}
                    postId={currentReel?.id || ""}
                    postContent={currentReel?.description || ""}
                    postAuthor={currentReel?.author || { id: "", name: "", handle: "", avatar: "" }}
                    comments={currentReel?.comments || []}
                    currentUserId={currentUserId}
                    onClose={() => setShowCommentModal(false)}
                  />
                </div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="hidden md:block">
        <AnimatePresence>
          {showCommentModal && currentReel && (
            <div className={cn(
              "transition-all duration-500 ease-in-out z-[120] overflow-hidden fixed top-0 right-0 h-screen w-[400px] border-l border-gray-100 dark:border-zinc-800 bg-white dark:bg-black",
              showCommentModal ? "translate-x-0" : "translate-x-full"
            )}>
              <ReelsCommentSidebar
                key={currentReel.id}
                postId={currentReel.id}
                postContent={currentReel.description}
                postAuthor={currentReel.author}
                comments={currentReel.comments}
                currentUserId={currentUserId}
                onClose={() => setShowCommentModal(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url="/reels"
        title="Check out this reel"
      />
    </div>
  )
}
