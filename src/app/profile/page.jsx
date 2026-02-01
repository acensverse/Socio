import { Feed } from "@/components/feed/Feed"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { prisma } from "@/lib/db"
import { getStoriesByUserId } from "@/actions/story"

export default async function ProfilePage({ searchParams }) {
  const { tab = "posts" } = await searchParams
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          followers: true,
          following: true
        }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  const stories = await getStoriesByUserId(user.id)
  
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
          bannerUrl: user.bannerUrl,
          showJoinedDate: user.showJoinedDate,
          createdAt: user.createdAt
        }} 
        counts={{
          followers: user._count?.followers || 0,
          following: user._count?.following || 0
        }}
        isOwnProfile={true}
        stories={stories}
        activeTab={tab}
      />
      <Feed authorId={user.id} tab={tab} />
    </div>
  )
}
