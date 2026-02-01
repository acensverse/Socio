"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function deleteStory(storyId) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true }
  })

  if (!story || story.authorId !== session.user.id) {
    throw new Error("Unauthorized or story not found")
  }

  await prisma.story.delete({
    where: { id: storyId }
  })

  revalidatePath("/")
}

export async function viewStory(storyId) {
  const session = await auth()
  if (!session?.user?.id) return

  try {
    // Get the story to check if the viewer is the owner
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { authorId: true }
    })

    // Don't track views if the viewer is the owner
    if (story?.authorId === session.user.id) return

    await prisma.storyView.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId: session.user.id
        }
      },
      update: {},
      create: {
        storyId,
        userId: session.user.id
      }
    })
  } catch (error) {
    console.error("Failed to track story view:", error)
  }
}

export async function getStories() {
  const stories = await prisma.story.findMany({
    where: {
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          views: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return stories
}

export async function getStoriesByUserId(userId) {
  const stories = await prisma.story.findMany({
    where: {
      authorId: userId,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true
        }
      },
      _count: {
        select: {
          views: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return stories
}

export async function getStoryViewers(storyId) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // Verify the user owns this story
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { authorId: true }
  })

  if (!story || story.authorId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  const viewers = await prisma.storyView.findMany({
    where: { storyId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return viewers.map(view => ({
    id: view.user.id,
    name: view.user.name,
    image: view.user.image,
    email: view.user.email,
    viewedAt: view.createdAt
  }))
}
