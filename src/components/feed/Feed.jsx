import { PostCard } from "./PostCard"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { cn } from "@/lib/utils"
import { PostGridItem } from "./PostGridItem"
import { ProfileGallery } from "./ProfileGallery"

export async function Feed({ authorId, tab = "all" }) {
  const session = await auth()
  
  let where = {}
  
  if (tab === "posts") {
    where = { 
      authorId, 
      mediaUrl: { not: null },
      mediaType: { not: "video" },
      isRepost: false
    }
  } else if (tab === "reels") {
    where = { 
      authorId, 
      mediaType: "video",
      isRepost: false
    }
  } else if (tab === "tweets") {
    where = { 
      authorId, 
      mediaUrl: null,
      isRepost: false
    }
  } else if (tab === "repost") {
    where = { 
      authorId, 
      isRepost: true
    }
  } else if (tab === "tagged") {
    where = { 
      taggedUsers: { some: { id: authorId } }
    }
  } else if (authorId) {
    where = { authorId }
  }

  const posts = await prisma.post.findMany({
    where,
    select: {
        id: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        createdAt: true,
        isRepost: true,
        originalPostId: true,
        originalPost: {
            select: {
                id: true,
                content: true,
                mediaUrl: true,
                mediaType: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        },
        author: {
            select: {
                id: true,
                name: true,
                email: true,
                image: true
            }
        },
        likes: {
            where: {
                authorId: session?.user?.id || ""
            },
            select: {
                id: true
            }
        },
        comments: {
            select: {
                id: true,
                content: true,
                replyToId: true,
                createdAt: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                },
                reactions: {
                    select: {
                        userId: true,
                        isLike: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        },
        _count: {
            select: {
                likes: true,
                comments: true
            }
        }
    },
    orderBy: {
        createdAt: 'desc'
    }
  })

  // Transform data for PostCard
  const transformedPosts = posts.map((post) => {
    const author = post.author || { id: "", name: "User", email: "user@example.com", image: null }
    return {
      id: post.id,
      author: {
          id: author.id,
          name: author.name || "User",
          handle: author.email?.split("@")[0] || "user",
          avatar: author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.email}`,
          verified: false
      },
      content: post.content || "",
      image: post.mediaUrl || undefined,
      mediaType: post.mediaType || undefined,
      timestamp: post.createdAt.toLocaleDateString(),
      isLiked: (post.likes || []).length > 0,
      currentUserId: session?.user?.id,
      comments: (post.comments || []).map((c) => ({
          id: c.id,
          content: c.content,
          createdAt: c.createdAt,
          author: {
              id: c.author?.id || "",
              name: c.author?.name || "User",
              image: c.author?.image || null,
              email: c.author?.email || null,
              handle: c.author?.email?.split("@")[0] || "user",
              avatar: c.author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.author?.email}`
          },
          replyToId: c.replyToId,
          reactions: (c.reactions || []).map((r) => ({
            userId: r.userId,
            isLike: r.isLike
          }))
      })),
      stats: { 
          likes: post._count?.likes || 0, 
          comments: post._count?.comments || 0, 
          reposts: 0, 
          views: 0 
      }
    }
  })

  const isGrid = tab === "posts" || tab === "reels"

  return (
    <div className={cn("pb-20 md:pb-0")}>
        {transformedPosts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
                No content found in this section.
            </div>
        ) : isGrid ? (
            <ProfileGallery posts={transformedPosts} tab={tab} />
        ) : (
            transformedPosts.map((post) => (
              <PostCard key={post.id} {...post} isProfileView={!!authorId} />
            ))
        )}
    </div>
  )
}
