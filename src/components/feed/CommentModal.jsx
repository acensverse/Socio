import { X, Send, Loader2, Heart, MessageSquare, ThumbsDown, MoreVertical, Pencil, Trash2 } from "lucide-react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addComment, toggleCommentLike, editComment, deleteComment } from "@/actions/post"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function CommentModal({ 
  postId, 
  postContent, 
  postImage, 
  postMediaType, 
  postAuthor, 
  comments, 
  currentUserId, 
  onClose,
  showMediaOnMobile = true,
  fullHeightOnMobile = false
}) {
  const router = useRouter()
  const [commentText, setCommentText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState(null)
  const [showMenuId, setShowMenuId] = useState(null)
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editValue, setEditValue] = useState("")
  const [expandedCommentIds, setExpandedCommentIds] = useState(new Set())

  const toggleReplies = (commentId) => {
    setExpandedCommentIds(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  // Group comments into parents and their children
  const parentComments = comments.filter(c => !c.replyToId)
  const getReplies = (parentId) => comments.filter(c => c.replyToId === parentId)

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addComment(postId, commentText, replyTo?.id)
      setCommentText("")
      setReplyTo(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to add comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleLike = async (commentId, isLike) => {
    try {
      await toggleCommentLike(commentId, isLike)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteComment = async (id) => {
    if (!confirm("Delete this comment?")) return
    try {
      await deleteComment(id)
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditComment = async (id) => {
    if (!editValue.trim()) return
    try {
      await editComment(id, editValue)
      setEditingCommentId(null)
      setEditValue("")
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    return `${days}d`
  }

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center pointer-events-auto md:p-10" 
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: fullHeightOnMobile ? 0 : "10%" }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.05}
          onDragEnd={(e, info) => {
            if (info.offset.y > 200 || info.velocity.y > 600) {
              onClose()
            }
          }}
          className="bg-background w-full h-[100dvh] md:h-auto md:max-h-[90vh] md:max-w-6xl rounded-t-[32px] md:rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl relative mt-auto md:mt-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Drag Handle */}
          <div className="md:hidden w-full flex justify-center p-3 sticky top-0 bg-background z-[60]">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full" />
          </div>

          {/* CLOSE BUTTON OVERLAY (Desktop) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 text-gray-500 dark:text-gray-400 rounded-full transition-colors z-50 hidden md:flex"
          >
            <X className="w-5 h-5" />
          </button>

        {/* Left Side Media (Desktop) / Top (Mobile) */}
        <div className={cn(
          "md:w-3/5 bg-black items-center justify-center relative md:min-h-[500px]",
          showMediaOnMobile ? "flex min-h-[300px]" : "hidden md:flex"
        )}>
           {postImage ? (
             postMediaType === 'video' ? (
                <video 
                  src={postImage} 
                  controls
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Image
                  src={postImage}
                  alt="Post content"
                  fill
                  className="object-contain"
                  priority
                />
              )
           ) : (
             <div className="p-10 text-white text-lg text-center font-medium">
               {postContent}
             </div>
           )}
        </div>

        {/* Right Side */}
        <div className="flex-1 flex flex-col min-w-0 bg-background max-h-full">
          {/* Post Caption (First item in scroll) */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-50 dark:border-gray-900/50">
              <div className="flex gap-3">
                <Image
                  src={postAuthor.avatar}
                  alt={postAuthor.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-bold mr-2">{postAuthor.name}</span>
                    {postContent}
                  </p>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="p-4 space-y-6">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                  <p className="text-sm">No comments yet</p>
                  <p className="text-xs mt-1">Be the first to comment</p>
                </div>
              ) : (
                parentComments.map((comment) => {
                  const avatar = comment.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.email}`
                  const displayName = comment.author.name || comment.author.email?.split("@")[0] || "User"
                  const hasLiked = comment.reactions?.some(r => r.userId === currentUserId && r.isLike)
                  const hasDisliked = comment.reactions?.some(r => r.userId === currentUserId && !r.isLike)
                  const likeCount = comment.reactions?.filter(r => r.isLike).length || 0
                  const isAuthor = currentUserId === comment.author.id
                  const replies = getReplies(comment.id)
                  const isExpanded = expandedCommentIds.has(comment.id)

                  return (
                    <div key={comment.id} className="space-y-4">
                      <div className="flex gap-3 group relative">
                        <Image
                          src={avatar}
                          alt={displayName}
                          width={32}
                          height={32}
                          className="rounded-full object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                              <p className="text-sm font-bold mr-2">{displayName}</p>
                              {isAuthor && (
                                  <div className="relative">
                                      <button 
                                          onClick={() => setShowMenuId(showMenuId === comment.id ? null : comment.id)}
                                          className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-all text-gray-400"
                                      >
                                          <MoreVertical className="w-3.5 h-3.5" />
                                      </button>
                                      {showMenuId === comment.id && (
                                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-lg shadow-xl z-50 py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100">
                                              <button 
                                                  onClick={() => {
                                                      setEditingCommentId(comment.id)
                                                      setEditValue(comment.content)
                                                      setShowMenuId(null)
                                                  }}
                                                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                              >
                                                  <Pencil className="w-3.5 h-3.5" /> Edit
                                              </button>
                                              <button 
                                                  onClick={() => {
                                                      handleDeleteComment(comment.id)
                                                      setShowMenuId(null)
                                                  }}
                                                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                              >
                                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>

                          {editingCommentId === comment.id ? (
                              <div className="mt-2 space-y-2">
                                  <textarea
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-2 text-sm text-gray-900 dark:text-white outline-none"
                                      rows={2}
                                      autoFocus
                                  />
                                  <div className="flex justify-end gap-2">
                                      <button 
                                          onClick={() => setEditingCommentId(null)}
                                          className="px-3 py-1 text-xs font-bold text-gray-500"
                                      >
                                          Cancel
                                      </button>
                                      <button 
                                          onClick={() => handleEditComment(comment.id)}
                                          className="px-3 py-1 text-xs font-bold text-primary"
                                      >
                                          Save
                                      </button>
                                  </div>
                              </div>
                          ) : (
                              <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">{comment.content}</p>
                          )}

                          <div className="flex items-center gap-5 mt-3 text-gray-500">
                            <span className="text-xs">{formatTimeAgo(comment.createdAt)}</span>
                            <button 
                              onClick={() => handleToggleLike(comment.id, true)}
                              className={cn(
                                "flex items-center gap-1 transition-colors group",
                                hasLiked ? "text-red-500" : "hover:text-red-500"
                              )}
                            >
                              <Heart className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} />
                              <span className="text-[11px] font-bold">{likeCount}</span>
                            </button>
                            <button 
                              onClick={() => handleToggleLike(comment.id, false)}
                              className={cn(
                                "flex items-center gap-1 transition-colors group",
                                hasDisliked ? "text-zinc-900 dark:text-white" : "hover:text-zinc-900 dark:hover:text-white"
                              )}
                            >
                              <ThumbsDown className={cn("w-3.5 h-3.5", hasDisliked && "fill-current")} />
                            </button>
                            <button 
                              onClick={() => {
                                  setReplyTo({ id: comment.id, name: displayName })
                                  setCommentText(`@${displayName} `)
                              }}
                              className="flex items-center gap-1 hover:text-blue-500 transition-colors group"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-bold">Reply</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Replies Toggle */}
                      {replies.length > 0 && (
                        <div className="ml-11">
                          <button 
                            onClick={() => toggleReplies(comment.id)}
                            className="flex items-center gap-4 group/reply"
                          >
                            <div className="h-[1px] w-6 bg-gray-200 dark:bg-zinc-800" />
                            <span className="text-xs font-bold text-gray-500 group-hover/reply:text-gray-900 dark:group-hover/reply:text-white transition-colors">
                              {isExpanded ? "Hide replies" : `View replies (${replies.length})`}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="mt-4 space-y-4">
                              {replies.map((reply) => {
                                const replyAvatar = reply.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author.email}`
                                const replyDisplayName = reply.author.name || reply.author.email?.split("@")[0] || "User"
                                const rHasLiked = reply.reactions?.some(r => r.userId === currentUserId && r.isLike)
                                const rHasDisliked = reply.reactions?.some(r => r.userId === currentUserId && !r.isLike)
                                const rLikeCount = reply.reactions?.filter(r => r.isLike).length || 0
                                const isReplyAuthor = currentUserId === reply.author.id

                                return (
                                  <div key={reply.id} className="flex gap-3 group relative">
                                    <Image
                                      src={replyAvatar}
                                      alt={replyDisplayName}
                                      width={24}
                                      height={24}
                                      className="rounded-full object-cover shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                          <p className="text-sm font-bold mr-2">{replyDisplayName}</p>
                                          {isReplyAuthor && (
                                              <div className="relative">
                                                  <button 
                                                      onClick={() => setShowMenuId(showMenuId === reply.id ? null : reply.id)}
                                                      className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full opacity-0 group-hover:opacity-100 transition-all text-gray-400"
                                                  >
                                                      <MoreVertical className="w-3 h-3" />
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                      <p className="text-sm mt-0.5 text-gray-700 dark:text-gray-300">{reply.content}</p>
                                      
                                      <div className="flex items-center gap-4 mt-2 text-gray-500">
                                        <span className="text-[10px]">{formatTimeAgo(reply.createdAt)}</span>
                                        <button 
                                          onClick={() => handleToggleLike(reply.id, true)}
                                          className={cn(
                                            "flex items-center gap-1 transition-colors group",
                                            rHasLiked ? "text-red-500" : "hover:text-red-500"
                                          )}
                                        >
                                          <Heart className={cn("w-3 h-3", rHasLiked && "fill-current")} />
                                          <span className="text-[10px] font-bold">{rLikeCount}</span>
                                        </button>
                                        <button 
                                          onClick={() => handleToggleLike(reply.id, false)}
                                          className={cn(
                                            "flex items-center gap-1 transition-colors group",
                                            rHasDisliked ? "text-zinc-900 dark:text-white" : "hover:text-zinc-900 dark:hover:text-white"
                                          )}
                                        >
                                          <ThumbsDown className={cn("w-3 h-3", rHasDisliked && "fill-current")} />
                                        </button>
                                        <button 
                                          onClick={() => {
                                              setReplyTo({ id: comment.id, name: replyDisplayName })
                                              setCommentText(`@${replyDisplayName} `)
                                          }}
                                          className="text-[10px] font-bold hover:text-blue-500 transition-colors"
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 mt-auto shrink-0 bg-background">
            {replyTo && (
              <div className="flex items-center justify-between mb-2 px-1 animate-in fade-in slide-in-from-bottom-1 duration-200">
                <span className="text-xs text-gray-500">
                  Replying to <span className="font-bold text-primary">@{replyTo.name}</span>
                </span>
                <button 
                  onClick={() => {
                      setReplyTo(null)
                      if (commentText.trim() === `@${replyTo.name}`) {
                          setCommentText("")
                      }
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <form onSubmit={handleAddComment} className="flex items-center gap-3">
              <Image
                src={postAuthor.avatar} // Use current user avatar if available
                alt="Your avatar"
                width={32}
                height={32}
                className="rounded-full object-cover shrink-0 hidden md:block"
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={replyTo ? `Reply to @${replyTo.name}...` : "Add a comment..."}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-transparent border border-gray-100 dark:border-gray-800 rounded-full px-4 py-2.5 text-sm outline-none focus:border-gray-300 dark:focus:border-gray-700 transition-colors pr-12"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-bold text-sm disabled:opacity-30 transition-opacity"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
    </AnimatePresence>
  )
}
