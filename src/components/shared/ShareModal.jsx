"use client"

import { X, Copy, Check } from "lucide-react"
import { useState } from "react"


export function ShareModal({ isOpen, onClose, url, title = "Check this out" }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareText = title
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: "💬",
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + fullUrl)}`,
      color: "hover:bg-green-50 dark:hover:bg-green-900/20"
    },
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20"
    },
    {
      name: "X (Twitter)",
      icon: "𝕏",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`,
      color: "hover:bg-gray-50 dark:hover:bg-gray-900"
    },
    {
      name: "Instagram",
      icon: "📷",
      action: handleCopyLink,
      color: "hover:bg-pink-50 dark:hover:bg-pink-900/20",
      subtitle: "Copy link to share"
    }
  ]

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-background rounded-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Share</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Options */}
        <div className="space-y-2 mb-4">
          {shareLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => {
                if (link.action) {
                  link.action()
                } else {
                  window.open(link.url, '_blank', 'noopener,noreferrer')
                }
              }}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${link.color}`}
            >
              <span className="text-2xl">{link.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium">{link.name}</div>
                {link.subtitle && <div className="text-xs text-gray-500">{link.subtitle}</div>}
              </div>
            </button>
          ))}
        </div>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          <span className="font-medium">{copied ? "Copied" : "Copy Link"}</span>
        </button>
      </div>
    </div>
  )
}
