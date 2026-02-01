"use client"

import { SquarePen, ChevronDown, Search, Plus, User, ArrowLeft, Phone, Video, Info, MessageCircle } from "lucide-react"
import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { ConversationList } from "@/components/messages/ConversationList"
import { MessageThread } from "@/components/messages/MessageThread"
import { MessageInput } from "@/components/messages/MessageInput"
import { NewMessageModal } from "@/components/messages/NewMessageModal"
import { getConversations, getMessages, sendMessage, getOrCreateConversation } from "@/actions/message"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

function MessagesContent() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('primary')

  useEffect(() => {
    if (!session?.user?.id) {
      if (session === null) router.push("/login")
      return
    }
    loadConversations()
  }, [session, router])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId])

  // Handle userId query parameter
  useEffect(() => {
    const userId = searchParams.get("userId")
    if (userId && session?.user?.id && conversations.length > 0) {
      handleSelectUser(userId)
    }
  }, [searchParams, session, conversations])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data || [])
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    setMessagesLoading(true)
    try {
      const data = await getMessages(conversationId)
      setMessages(data || [])
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (content, formData) => {
    if (!selectedConversationId) return

    try {
      const newMessage = await sendMessage(selectedConversationId, content, formData)
      setMessages(prev => [...prev, newMessage])
      await loadConversations() // Refresh conversation list to update last message
    } catch (error) {
      console.error("Failed to send message:", error)
      throw error
    }
  }

  const handleSelectUser = async (userId) => {
    try {
      const conversationId = await getOrCreateConversation(userId)
      setSelectedConversationId(conversationId)
      loadConversations()
    } catch (error) {
      console.error("Failed to create conversation:", error)
      alert("Failed to start conversation. Please try again.")
    }
  }

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="h-screen bg-background overflow-hidden pb-20 md:pb-0">
      <div className="flex h-full">
        {/* Message Thread (Wide, Left) */}
        <div className={`flex-1 flex flex-col ${
          selectedConversationId ? "flex" : "hidden md:flex"
        }`}>
          {selectedConversationId && selectedConversation ? (
            <>
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-background sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full -ml-2"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="relative w-11 h-11">
                    <Image 
                      src={selectedConversation.otherUser?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.otherUser?.email}`}
                      alt="avatar"
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-bold leading-tight">
                      {selectedConversation.otherUser?.name || "User"}
                    </h2>
                    <span className="text-xs text-gray-400">Active now</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full transition-colors">
                    <Phone className="w-6 h-6" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full transition-colors">
                    <Video className="w-6 h-6" />
                  </button>
                  <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full transition-colors">
                    <Info className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              {messagesLoading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Loading messages...</p>
                </div>
              ) : (
                <MessageThread messages={messages} currentUserId={session.user.id} />
              )}

              {/* Input */}
              <MessageInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center flex flex-col items-center">
                <div className="w-24 h-24 rounded-full border-[3px] border-foreground flex items-center justify-center mb-4">
                    <MessageCircle className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Your messages</h3>
                <p className="text-sm text-gray-500 mt-2">Send a message to start a chat</p>
                <button 
                  onClick={() => setShowNewMessageModal(true)}
                  className="mt-6 bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
                >
                    Send message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (Right) */}
        <div className={`w-full md:w-[397px] border-l border-gray-200 dark:border-gray-800 flex flex-col ${
          selectedConversationId ? "hidden md:flex" : "flex"
        }`}>
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between sticky top-0 bg-background z-10">
            <div className="flex items-center gap-1 cursor-pointer">
              <h1 className="text-lg font-black tracking-tight">
                {session?.user?.name || session?.user?.email?.split("@")[0] || "fairyarc"}
              </h1>
              <ChevronDown className="w-4 h-4 mt-1" />
            </div>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <SquarePen className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 dark:border-gray-800 sticky top-[68px] bg-background z-10">
            {['primary', 'general', 'requests'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 py-3 text-sm font-semibold capitalize transition-colors relative",
                  activeTab === tab 
                    ? "text-foreground" 
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground mx-auto w-full" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Search */}
            <div className="px-4 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-100 dark:bg-zinc-900 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="px-4 pb-4 overflow-x-auto flex gap-6 no-scrollbar">
              <div className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group">
                <div className="relative w-16 h-16">
                  <div className="w-full h-full rounded-full border border-gray-100 overflow-hidden bg-gray-200">
                    {session?.user?.image ? (
                        <Image src={session.user.image} alt="You" fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <User className="w-8 h-8" />
                        </div>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-1 shadow-sm z-20">
                    <p className="text-[10px] text-gray-500 line-clamp-2 max-w-[60px]">Your thoughts go here...</p>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-1 shadow-sm z-20">
                    <span className="w-3 h-3 text-gray-500">+</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">Your note</span>
              </div>

              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden p-[2.5px] bg-gradient-to-tr from-yellow-400 to-fuchsia-600">
                    <div className="bg-white dark:bg-black rounded-full p-[2px] w-full h-full">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="user" fill className="object-cover" />
                        </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full text-center">User {i}</span>
                </div>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32 text-gray-500">
                <p>Loading conversations...</p>
              </div>
            ) : (
              <ConversationList
                conversations={conversations.filter(c => activeTab === 'primary')} // Mocking tab filtering
                selectedId={selectedConversationId || undefined}
                onSelect={setSelectedConversationId}
              />
            )}
          </div>
        </div>
      </div>


      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onSelectUser={handleSelectUser}
        />
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
