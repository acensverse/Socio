"use client"

import { ArrowLeft, Calendar, Link as LinkIcon, MapPin, Mail, Settings, Moon, Sun, UserPlus, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { followUser, unfollowUser } from "@/actions/user"
import { useRouter } from "next/navigation"
import { FollowListModal } from "./FollowListModal"
import { useSession, signOut } from "next-auth/react"
import { EditProfileModal } from "./EditProfileModal"
import { StoryViewer } from "../stories/StoryViewer"


export function ProfileHeader({ 
  user, 
  counts = { followers: 0, following: 0 }, 
  isFollowing = false, 
  isOwnProfile = true,
  stories = [],
  activeTab = "posts"
}) {
  const { data: session } = useSession()
  const [followingState, setFollowingState] = useState(isFollowing)
  const [followerCount, setFollowerCount] = useState(counts.followers)
  const [modalType, setModalType] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove("dark")
      setIsDarkMode(false)
    }
  }, [])

  const setLightMode = () => {
    document.documentElement.classList.remove("dark")
    localStorage.setItem("theme", "light")
    setIsDarkMode(false)
  }

  const setDarkMode = () => {
    document.documentElement.classList.add("dark")
    localStorage.setItem("theme", "dark")
    setIsDarkMode(true)
  }

  const handle = user.email?.split("@")[0] || "user"
  const avatar = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`


  const handleFollowToggle = async () => {
    try {
      if (followingState) {
        setFollowingState(false)
        setFollowerCount(prev => prev - 1)
        await unfollowUser(user.id)
      } else {
        setFollowingState(true)
        setFollowerCount(prev => prev + 1)
        await followUser(user.id)
      }
      router.refresh()
    } catch (error) {
      console.error(error)
      // Rollback on error
      setFollowingState(followingState)
      setFollowerCount(followerCount)
      alert("Failed to update follow status")
    }
  }

  const joinedDate = user.createdAt ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt)) : "January 2026"

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "reels", label: "Reels" },
    { id: "tweets", label: "Tweet" },
    { id: "repost", label: "Repost" },
    { id: "tagged", label: "Tagged" }
  ]

  const handleTabChange = (tabId) => {
    const params = new URLSearchParams(window.location.search)
    params.set("tab", tabId)
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="bg-background">
      {/* Header with Back Button (Mobile) */}
      <div className="sticky top-0 bg-background/80 backdrop-blur z-20 px-4 py-2 flex items-center justify-between md:hidden">
         <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
               <h1 className="font-bold text-lg">{user.name || "User"}</h1>
               <p className="text-xs text-gray-500">View profile</p>
            </div>
         </div>
         
         {isOwnProfile && (
           <div className="relative">
             <button 
               onClick={() => setShowSettings(!showSettings)}
               className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
             >
                <Settings className="w-5 h-5" />
             </button>

             {showSettings && (
               <>
                 <div 
                   className="fixed inset-0 z-30" 
                   onClick={() => setShowSettings(false)}
                 />
                 <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl shadow-2xl z-40 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {!isDarkMode ? (
                      <button 
                        onClick={() => {
                          setDarkMode()
                          setShowSettings(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Moon className="w-4 h-4" />
                        </div>
                        <span className="font-bold">Dark mode</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setLightMode()
                          setShowSettings(false)
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="font-bold">Light mode</span>
                      </button>
                    )}

                    <Link 
                      href="/settings"
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-300">
                        <Settings className="w-4 h-4" />
                      </div>
                      <span className="font-bold">Settings</span>
                    </Link>

                    <button 
                      onClick={() => {
                        // Logic for switch accounts
                        setShowSettings(false)
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500 dark:text-green-400">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="font-bold">Switch accounts</span>
                    </button>

                    <div className="my-2 border-t border-gray-100 dark:border-zinc-800" />

                    <button 
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="font-bold">Logout</span>
                    </button>
                 </div>
               </>
             )}
           </div>
         )}
      </div>

      {/* Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden group">
        {user.bannerUrl && (
          <Image 
            src={user.bannerUrl} 
            alt="Banner" 
            fill 
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-800 relative">
         <div className="flex justify-between items-start">
            <div className="mt-[-15%] md:mt-[-10%] mb-3 relative">
               <div 
                 onClick={() => stories.length > 0 && setModalType("story")}
                 className={`w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-background overflow-hidden bg-gray-200 relative ${stories.length > 0 ? "cursor-pointer p-1 bg-gradient-to-tr from-yellow-400 via-orange-500 to-pink-500" : ""}`}
               >
                  <div className={`w-full h-full rounded-full border-2 border-background overflow-hidden relative`}>
                    <Image 
                      src={avatar} 
                      alt="Profile" 
                      fill
                      className="object-cover rounded-full" 
                    />
                  </div>
               </div>
            </div>
            {isOwnProfile ? (
              <button 
                onClick={() => setModalType("edit")}
                className="mt-4 px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                 Edit profile
              </button>
            ) : (
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={handleFollowToggle}
                  className={`px-6 py-1.5 rounded-full font-bold transition-colors ${
                    followingState 
                      ? "border border-gray-300 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {followingState ? "Following" : "Follow"}
                </button>
                <Link
                  href={`/messages?userId=${user.id}`}
                  className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-full font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Message</span>
                </Link>
              </div>
            )}
         </div>

         <div className="mt-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold">{user.name || "User"}</h1>
              {user.pronouns && <span className="text-gray-500 text-sm mt-1">({user.pronouns})</span>}
            </div>
            <p className="text-gray-500">@{handle}</p>
         </div>

         {user.bio ? (
           <p className="mt-4 text-[15px] whitespace-pre-wrap leading-relaxed">
              {user.bio}
           </p>
         ) : isOwnProfile ? (
           <p className="mt-4 text-[15px] text-gray-500 italic">
              Add a bio to tell people about yourself...
           </p>
         ) : null}

         <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-gray-500 text-sm">
            {user.location && (
              <div className="flex items-center gap-1">
                 <MapPin className="w-4 h-4" />
                 <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                 <LinkIcon className="w-4 h-4" />
                 <a href={user.website.startsWith('http') ? user.website : `https://${user.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                   {user.website.replace(/^https?:\/\//, '')}
                 </a>
              </div>
            )}
            {user.showJoinedDate !== false && (
              <div className="flex items-center gap-1">
                 <Calendar className="w-4 h-4" />
                 <span>Joined {joinedDate}</span>
              </div>
            )}
         </div>

         <div className="flex gap-4 mt-4 text-sm">
            <div 
              className="hover:underline cursor-pointer"
              onClick={() => setModalType("following")}
            >
               <span className="font-bold text-foreground">{counts.following}</span> <span className="text-gray-500">Following</span>
            </div>
            <div 
              className="hover:underline cursor-pointer"
              onClick={() => setModalType("followers")}
            >
               <span className="font-bold text-foreground">{followerCount}</span> <span className="text-gray-500">Followers</span>
            </div>
         </div>
      </div>

      {modalType === "edit" && (
        <EditProfileModal 
          user={user}
          onClose={() => setModalType(null)}
        />
      )}

      {(modalType === "followers" || modalType === "following") && (
        <FollowListModal 
          userId={user.id}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}

      {modalType === "story" && stories.length > 0 && (
        <StoryViewer 
          stories={stories}
          initialIndex={0}
          onClose={() => setModalType(null)}
          currentUserId={session?.user?.id}
        />
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
         {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 hover:bg-gray-50 dark:hover:bg-gray-900 py-4 text-sm font-bold text-center relative ${activeTab === tab.id ? "text-foreground" : "text-gray-500"}`}
            >
               {tab.label}
               {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full"></div>}
            </button>
         ))}
      </div>
    </div>
  )
}
