import { prisma } from "@/lib/db"
import { ExploreGrid } from "@/components/explore/ExploreGrid"
import { auth } from "@/auth"

export default async function ExplorePage() {
  const session = await auth()

  const posts = await prisma.post.findMany({
    where: {
      mediaUrl: { not: null }
    },
    select: {
        id: true,
        content: true,
        mediaUrl: true,
        mediaType: true,
        createdAt: true,
        isRepost: true,
        originalPostId: true,
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

  // Transform data for PostGridItem (Similar to Feed.tsx)
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

  return (
    <div className="flex-1 min-h-screen border-x border-gray-200 dark:border-gray-800">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold">Explore</h1>
      </div>
      
      {transformedPosts.length > 0 ? (
        <ExploreGrid posts={transformedPosts} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg">Nothing to explore yet.</p>
          <p className="text-sm">Be the first to share something</p>
        </div>
      )}
    </div>
  )
}
