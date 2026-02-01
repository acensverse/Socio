"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, ChevronUp, ChevronDown, SquarePen, ArrowLeft } from "lucide-react"
import { getConversations, getMessages, sendMessage } from "@/actions/message"
import { ConversationList } from "./ConversationList"
import { MessageThread } from "./MessageThread"
import { MessageInput } from "./MessageInput"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export function MessageSlider() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
 
  // Don't show on messages page or auth pages
  const isExcludedPage = pathname === "/messages" || pathname === "/login" || pathname === "/register"
 
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (session && isOpen && !isMobile) {
      loadConversations()
    }
  }, [session, isOpen, isMobile])

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId)
    }
  }, [selectedConversationId])

  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (error) {
      console.error("Failed to load conversations:", error)
    }
  }

  const loadMessages = async (conversationId) => {
    setMessagesLoading(true)
    try {
      const data = await getMessages(conversationId)
      setMessages(data)
    } catch (error) {
      console.error("Failed to load messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }

  const handleSendMessage = async (content) => {
    if (!selectedConversationId) return

    try {
      const newMessage = await sendMessage(selectedConversationId, content)
      setMessages(prev => [...prev, newMessage])
      await loadConversations()
    } catch (error) {
      console.error("Failed to send message:", error)
      throw error
    }
  }

  if (isExcludedPage || !session || isMobile) return null

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  const totalUnread = conversations.reduce((acc, curr) => acc + curr.unreadCount, 0)

  return (
    <div className="fixed bottom-4 right-4 z-50 hidden md:flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-80 h-[480px] bg-background border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-background z-10 shrink-0">
              <div className="flex items-center gap-2">
                {selectedConversationId && (
                  <button 
                    onClick={() => setSelectedConversationId(null)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <h2 className="font-bold text-base truncate max-w-[150px]">
                  {selectedConversationId 
                    ? (selectedConversation?.otherUser?.name || selectedConversation?.otherUser?.email?.split("@")[0] || "User")
                    : "Messages"}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                {!selectedConversationId && (
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <SquarePen className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {selectedConversationId ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {messagesLoading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                      <p>Loading messages...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto">
                        <MessageThread messages={messages} currentUserId={session?.user?.id || ""} />
                      </div>
                      <div className="shrink-0 p-2 bg-background border-t border-gray-100 dark:border-gray-800">
                        <MessageInput onSend={handleSendMessage} />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  <ConversationList 
                    conversations={conversations} 
                    selectedId={undefined}
                    onSelect={setSelectedConversationId} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {totalUnread}
            </span>
          )}
        </div>
        <span className="font-bold">Messages</span>
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </motion.button>
    </div>
  )
}
