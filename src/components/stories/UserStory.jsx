"use client"

import { Plus, Loader2 } from "lucide-react"
import Image from "next/image"
import { useState, useRef } from "react"
import { uploadMedia } from "@/actions/upload"

export function UserStory({ user }) {
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef(null)

    const avatar = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'user'}`

    const handleUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const result = await uploadMedia(formData, "story")
            if (!result.success) throw new Error(result.error)
        } catch (error) {
            console.error(error)
            alert("Failed to upload story")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-1 min-w-[70px] cursor-pointer group">
            <div 
                className="relative w-[68px] h-[68px] rounded-full p-[3px] bg-transparent"
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <div className="w-full h-full rounded-full border-4 border-background overflow-hidden relative bg-gray-200">
                    <Image 
                        src={avatar} 
                        alt="Your story" 
                        width={68}
                        height={68}
                        className={`object-cover transition-transform group-hover:scale-110 ${uploading ? "opacity-50" : ""}`} 
                    />
                    
                    <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 border-2 border-background">
                        {uploading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                            <Plus className="w-3 h-3" strokeWidth={4} />
                        )}
                    </div>
                </div>
            </div>
            <span className="text-xs text-gray-500 truncate w-full text-center">
                Your Story
            </span>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={handleUpload}
            />
        </div>
    )
}
