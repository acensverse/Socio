"use client"

import { X, Search } from "lucide-react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { searchUsers } from "@/actions/message"

export function NewMessageModal({ onClose, onSelectUser }) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true)
        try {
          const results = await searchUsers(query)
          setUsers(results || [])
        } catch (error) {
          console.error("Failed to search users:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setUsers([])
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const handleSelectUser = (userId) => {
    onSelectUser(userId)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold">New Message</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              autoFocus
              className="w-full bg-gray-100 dark:bg-gray-900 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>Searching...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <p>{query.trim() ? "No users found" : "Start typing to search users"}</p>
            </div>
          ) : (
            <div>
              {users.map((user) => {
                const avatar = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
                const displayName = user.name || user.email?.split("@")[0] || "User"
                const handle = user.email?.split("@")[0] || "user"

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                  >
                    <Image
                      src={avatar}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="rounded-full bg-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{displayName}</p>
                      <p className="text-sm text-gray-500 truncate">@{handle}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
