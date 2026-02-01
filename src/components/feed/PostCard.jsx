"use client"

import Link from "next/link"
import Image from "next/image"
import { MoreHorizontal, ShieldCheck, Trash2, Edit2, Loader2, X } from "lucide-react"
import { ActionButtons } from "./ActionButtons"
import { CommentModal } from "./CommentModal"
import { useState } from "react"
import { deletePost, editPost } from "@/actions/post"

export function PostCard({ 
  id, 
  author, 
  content: initialContent, 
  image, 
  mediaType,
  timestamp, 
  isLiked,
  currentUserId,
  comments, 
  stats,
  isProfileView = false
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(initialContent)
  const [content, setContent] = useState(initialContent)
  const [showCommentModal, setShowCommentModal] = useState(false)
  const [videoProgress, setVideoProgress] = useState({ currentTime: 0, duration: 0 })
  const [showFullscreen, setShowFullscreen] = useState(false)
  
  const isAuthor = currentUserId === author.id

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return
    
    setIsDeleting(true)
    try {
      await deletePost(id)
    } catch (error) {
      console.error(error)
      alert("Failed to delete post")
      setIsDeleting(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return

    setIsEditing(false)
    const oldContent = content
    setContent(editContent.trim()) // Optimistic update
    
    try {
      await editPost(id, editContent)
    } catch (error) {
      setContent(oldContent)
      console.error(error)
      alert("Failed to edit post")
    }
  }

  return (
    <article className="border-b border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer relative">
      {/* Header, Name, Handle, Time, Menu */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Avatar */}
          <Link href={`/profile/${author.id}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden relative bg-gray-200 hover:opacity-90 transition-opacity">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  width={44}
                  height={44}
                  className="object-cover"
                />
            </div>
          </Link>

          {/* User Info */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <Link href={`/profile/${author.id}`} className="font-bold hover:underline truncate" onClick={(e) => e.stopPropagation()}>
                {author.name}
              </Link>
              {author.verified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />}
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-gray-500 leading-none">
              <span className="truncate">@{author.handle}</span>
              <span className="flex-shrink-0">· {timestamp}</span>
            </div>
          </div>
        </div>
        
        {isAuthor && (
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="text-gray-500 hover:text-primary rounded-full p-2 hover:bg-blue-500/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-background border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-10 py-1 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                    setShowMenu(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit Post
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete()
                    setShowMenu(false)
                  }}
                  disabled={isDeleting}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-3">
        {/* Text Content */}
        <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {isEditing ? (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                autoFocus
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-transparent border border-gray-200 dark:border-gray-800 rounded-lg p-3 focus:border-primary outline-none text-[15px]"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 rounded-full text-sm font-bold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleEdit}
                  className="px-4 py-1.5 rounded-full text-sm font-bold bg-primary text-white hover:bg-opacity-90 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            content
          )}
        </div>

        {/* Image/Video Content */}
        {image && (
          <div 
            onClick={() => setShowFullscreen(true)}
            className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 max-h-[500px] flex items-center justify-center cursor-zoom-in"
          >
            {mediaType === 'video' ? (
              <div className="relative group/video w-full">
                <video 
                  src={image} 
                  className="w-full h-auto max-h-[500px] object-contain cursor-pointer"
                  muted
                  playsInline
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget
                    setVideoProgress({ currentTime: video.currentTime, duration: video.duration })
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget
                    setVideoProgress({ currentTime: video.currentTime, duration: video.duration })
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    const video = e.currentTarget
                    if (video.paused) video.play()
                    else video.pause()
                  }}
                />
                
                {/* Seek Bar Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover/video:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 h-1 flex items-center group/seekbar cursor-pointer">
                      <input
                        type="range"
                        min={0}
                        max={videoProgress.duration || 100}
                        step={0.1}
                        value={videoProgress.currentTime}
                        onChange={(e) => {
                          const video = e.currentTarget.parentElement?.parentElement?.parentElement?.previousElementSibling
                          if (video) {
                            const val = parseFloat(e.target.value)
                            video.currentTime = val
                            setVideoProgress(prev => ({ ...prev, currentTime: val }))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 w-full h-full appearance-none bg-white/20 rounded-full cursor-pointer z-10 accent-white [&::-webkit-slider-thumb]:appearance-none"
                      />
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all duration-75"
                        style={{ width: `${(videoProgress.currentTime / (videoProgress.duration || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-white font-medium tabular-nums drop-shadow-sm">
                      {Math.floor(videoProgress.currentTime / 60)}:{(Math.floor(videoProgress.currentTime % 60)).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Image
                src={image}
                alt="Post content"
                width={800}
                height={800}
                className="w-full h-auto max-h-[500px] object-contain"
                loading="lazy"
              />
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 -mx-2">
          <ActionButtons 
            postId={id}
            likes={stats.likes}
            comments={stats.comments}
            reposts={stats.reposts}
            views={stats.views}
            isLikedInitially={isLiked}
            onCommentClick={() => setShowCommentModal(true)}
          />
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal
          postId={id}
          postContent={content}
          postImage={image}
          postMediaType={mediaType}
          postAuthor={author}
          comments={comments}
          currentUserId={currentUserId}
          onClose={() => setShowCommentModal(false)}
          showMediaOnMobile={false}
          fullHeightOnMobile={isProfileView}
        />
      )}

      {/* Fullscreen Media Viewer */}
      {showFullscreen && image && (
        <div 
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center animate-in fade-in duration-200"
          onClick={(e) => {
            e.stopPropagation()
            setShowFullscreen(false)
          }}
        >
          <button 
            className="absolute top-4 right-4 p-3 text-white hover:bg-white/10 rounded-full z-[110] transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setShowFullscreen(false)
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
            {mediaType === 'video' ? (
              <video 
                src={image} 
                className="max-w-full max-h-full object-contain shadow-2xl"
                autoPlay
                controls
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={image}
                  alt="Fullscreen content"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  )
}
