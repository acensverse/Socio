"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPost(formData) {
  const session = await auth()
  
  if (!session || !session.user) {
    throw new Error("Unauthorized")
  }

  const content = (formData.get("content") || "").trim()
  const mediaUrl = formData.get("mediaUrl")
  const mediaType = formData.get("mediaType")

  if (!content && !mediaUrl) {
    throw new Error("Content or media is required")
  }

  await prisma.post.create({
    data: {
      content,
      mediaUrl,
      mediaType, // "image" or "video"
      authorId: session.user.id,
    },
  })

  revalidatePath("/")
  return { success: true }
}

export async function deletePost(postId) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })

  if (!post || post.authorId !== session.user.id) {
    throw new Error("Unauthorized or post not found")
  }

  await prisma.post.delete({
    where: { id: postId }
  })

  revalidatePath("/")
  return { success: true }
}

export async function editPost(postId, content) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  })

  if (!post || post.authorId !== session.user.id) {
    throw new Error("Unauthorized or post not found")
  }

  await prisma.post.update({
    where: { id: postId },
    data: { content: content.trim() }
  })

  revalidatePath("/")
  return { success: true }
}

export async function toggleLike(postId) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existingLike = await prisma.like.findUnique({
    where: {
      authorId_postId: {
        authorId: session.user.id,
        postId: postId
      }
    }
  })

  if (existingLike) {
    await prisma.like.delete({
      where: { id: existingLike.id }
    })
  } else {
    await prisma.like.create({
      data: {
        postId: postId,
        authorId: session.user.id
      }
    })
  }

  revalidatePath("/")
  return { success: true }
}

export async function addComment(postId, content, parentId) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!content.trim()) throw new Error("Comment cannot be empty")

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId: postId,
      authorId: session.user.id,
      replyToId: parentId || null
    }
  })

  revalidatePath("/")
  return { success: true }
}

export async function toggleCommentLike(commentId, isLike) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const existingLike = await prisma.commentLike.findUnique({
    where: {
      commentId_userId: {
        commentId: commentId,
        userId: session.user.id
      }
    }
  })

  if (existingLike) {
    // If clicking the same button, remove the like/dislike
    if (existingLike.isLike === isLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id }
      })
    } else {
      // If switching from like to dislike or vice versa, update
      await prisma.commentLike.update({
        where: { id: existingLike.id },
        data: { isLike }
      })
    }
  } else {
    // Create new like/dislike
    await prisma.commentLike.create({
      data: {
        commentId: commentId,
        userId: session.user.id,
        isLike: isLike
      }
    })
  }

  revalidatePath("/")
  return { success: true }
}
export async function deleteComment(commentId) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, postId: true }
  })

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("Unauthorized or comment not found")
  }

  await prisma.comment.delete({
    where: { id: commentId }
  })

  revalidatePath("/")
  return { success: true }
}

export async function editComment(commentId, content) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (!content.trim()) throw new Error("Comment cannot be empty")

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true }
  })

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("Unauthorized or comment not found")
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content: content.trim() }
  })

  revalidatePath("/")
  return { success: true }
}
