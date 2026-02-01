"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function getConversations() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id
        }
      }
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      },
      messages: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  // Transform to include other participant and unread count
  const transformedConversations = conversations.map((conv) => {
    const otherParticipant = conv.participants.find((p) => p.userId !== session.user?.id)
    const currentParticipant = conv.participants.find((p) => p.userId === session.user?.id)
    const lastMessage = conv.messages[0]

    return {
      id: conv.id,
      otherUser: otherParticipant?.user || null,
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.senderId
      } : null,
      updatedAt: conv.updatedAt,
      unreadCount: 0 // Can be calculated based on lastReadAt if needed
    }
  })

  return transformedConversations
}

export async function getOrCreateConversation(participantId) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (session.user.id === participantId) {
    throw new Error("Cannot create conversation with yourself")
  }

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: {
              userId: session.user.id
            }
          }
        },
        {
          participants: {
            some: {
              userId: participantId
            }
          }
        }
      ]
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      }
    }
  })

  if (existingConversation) {
    return existingConversation.id
  }

  // Create new conversation
  const newConversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: session.user.id },
          { userId: participantId }
        ]
      }
    }
  })

  revalidatePath('/messages')
  return newConversation.id
}

export async function getMessages(conversationId) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: session.user.id
    }
  })

  if (!participant) {
    throw new Error("Not authorized to view this conversation")
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  return messages
}

export async function sendMessage(conversationId, content, formData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: session.user.id
    }
  })

  if (!participant) {
    throw new Error("Not authorized to send messages in this conversation")
  }

  let mediaUrl = null
  let mediaType = null

  // Handle media upload if provided
  if (formData) {
    const file = formData.get("file")
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`
      const resourceType = file.type.startsWith('video') ? 'video' : 'image'
      const result = await uploadToCloudinary(fileBase64, 'messages', resourceType)
      mediaUrl = result.secure_url
      mediaType = resourceType
    }
  }

  const message = await prisma.message.create({
    data: {
      content: content.trim() || "",
      mediaUrl,
      mediaType,
      conversationId,
      senderId: session.user.id
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    }
  })

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  })

  revalidatePath('/messages')
  revalidatePath(`/messages/${conversationId}`)
  
  return message
}

export async function markAsRead(conversationId) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: session.user.id
    },
    data: {
      lastReadAt: new Date()
    }
  })

  revalidatePath('/messages')
}

export async function searchUsers(query) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  if (!query.trim()) {
    return []
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: session.user.id
          }
        },
        {
          OR: [
            {
              name: {
                contains: query
              }
            },
            {
              email: {
                contains: query
              }
            }
          ]
        }
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
