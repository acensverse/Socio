"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function followUser(userIdToFollow) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const currentUserId = session.user.id

  if (currentUserId === userIdToFollow) {
    throw new Error("You cannot follow yourself")
  }

  await prisma.follow.create({
    data: {
      followerId: currentUserId,
      followingId: userIdToFollow
    }
  })

  revalidatePath(`/profile/${userIdToFollow}`)
  revalidatePath(`/profile/${currentUserId}`)
  return { success: true }
}

export async function unfollowUser(userIdToUnfollow) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")
  
  const currentUserId = session.user.id

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userIdToUnfollow
      }
    }
  })

  revalidatePath(`/profile/${userIdToUnfollow}`)
  revalidatePath(`/profile/${currentUserId}`)
  return { success: true }
}

export async function searchUsers(query) {
  if (!query || query.length < 2) return []

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { email: { contains: query } }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true
    },
    take: 10
  })

  return users
}

export async function getFollowers(userId) {
  const follows = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  return follows.map(f => f.follower)
}

export async function getFollowing(userId) {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  return follows.map(f => f.following)
}

export async function updateProfile(formData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name")
  const bio = formData.get("bio")
  const location = formData.get("location")
  const website = formData.get("website")
  const pronouns = formData.get("pronouns")
  const dobString = formData.get("dob")
  const showJoinedDate = formData.get("showJoinedDate") === "true"

  const imageFile = formData.get("imageFile")
  const bannerFile = formData.get("bannerFile")

  let image = formData.get("image")
  let bannerUrl = formData.get("bannerUrl")

  // Handle Avatar Upload
  if (imageFile && imageFile.size > 0) {
    const bytes = await imageFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileBase64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`
    const result = await uploadToCloudinary(fileBase64, 'avatars', 'image')
    image = result.secure_url
  }

  // Handle Banner Upload
  if (bannerFile && bannerFile.size > 0) {
    const bytes = await bannerFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileBase64 = `data:${bannerFile.type};base64,${buffer.toString('base64')}`
    const result = await uploadToCloudinary(fileBase64, 'banners', 'image')
    bannerUrl = result.secure_url
  }

  const dob = dobString ? new Date(dobString) : null

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio,
      location,
      website,
      pronouns,
      dob,
      image,
      bannerUrl,
      showJoinedDate,
    },
  })

  revalidatePath("/profile")
  revalidatePath(`/profile/${session.user.id}`)
  return { success: true }
}
