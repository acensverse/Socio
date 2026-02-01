import { ReelsPlayer } from "@/components/reels/ReelsPlayer"
import { prisma } from "@/lib/db"
import { auth } from "@/auth"

export default async function ReelsPage() {
  const session = await auth()
  
  const reels = await prisma.post.findMany({
    where: {
      mediaType: "video",
      mediaUrl: { not: null }
    },
    include: {
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
        }
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          reactions: true
        },
        orderBy: {
          createdAt: 'desc'
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

  // Transform for ReelsPlayer
  const transformedReels = reels.map(reel => ({
    id: reel.id,
    url: reel.mediaUrl,
    author: {
      id: reel.author.id,
      name: reel.author.name || reel.author.email?.split("@")[0] || "User",
      handle: reel.author.email?.split("@")[0] || "user",
      avatar: reel.author.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.author.email}`,
      verified: false // SQLite doesn't have this field in our current schema it seems
    },
    description: reel.content || "",
    likes: reel._count.likes.toString(),
    commentsCount: reel._count.comments.toString(),
    comments: reel.comments.map(c => ({
      ...c,
      author: {
        ...c.author,
        name: c.author.name || c.author.email?.split("@")[0] || "User"
      }
    })),
    isLiked: reel.likes.length > 0
  }))

  return (
    <div className="h-screen w-full bg-black">
      {transformedReels.length > 0 ? (
        <ReelsPlayer reels={transformedReels} currentUserId={session?.user?.id} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-white gap-4 p-4 text-center">
            <p className="text-xl font-bold">No reels yet</p>
            <p className="opacity-60">Be the first to upload a video post</p>
        </div>
      )}
    </div>
  )
}
