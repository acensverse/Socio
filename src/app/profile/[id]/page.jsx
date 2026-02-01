import { Feed } from "@/components/feed/Feed"
import { auth } from "@/auth"
import { redirect, notFound } from "next/navigation"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { prisma } from "@/lib/db"
import { getStoriesByUserId } from "@/actions/story"

export default async function UserProfilePage({ 
  params,
  searchParams
}) {
  const { id } = await params
  const { tab = "posts" } = await searchParams
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          followers: true,
          following: true
        }
      },
      followers: {
        where: { followerId: session.user.id },
        select: { followerId: true }
      }
    }
  })

  if (!user) {
    notFound()
  }

  const isFollowing = user.followers.length > 0
  const isOwnProfile = session.user.id === id
  const stories = await getStoriesByUserId(id)

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <ProfileHeader 
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          bio: user.bio,
          location: user.location,
          website: user.website,
          pronouns: user.pronouns,
          dob: user.dob,
          showJoinedDate: user.showJoinedDate,
          createdAt: user.createdAt
        }}
        counts={{
          followers: user._count?.followers || 0,
          following: user._count?.following || 0
        }}
        isFollowing={isFollowing}
        isOwnProfile={isOwnProfile}
        stories={stories}
        activeTab={tab}
      />
      <Feed authorId={id} tab={tab} />
    </div>
  )
}
