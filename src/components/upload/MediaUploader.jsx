"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { X, Image as ImageIcon, Film, Upload } from "lucide-react"

export function MediaUploader({ onFileSelect }) {
    const [previewUrl, setPreviewUrl] = useState(null)
    const [mediaType, setMediaType] = useState("image")
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            onFileSelect?.(file, mediaType)
        }
    }

    const clearMedia = () => {
        setPreviewUrl(null)
        onFileSelect?.(null, mediaType)
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    return (
        <div className="p-4 border border-dashed rounded-lg border-gray-300 dark:border-gray-700">
            {!previewUrl ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => {
                                setMediaType("image")
                                if (fileInputRef.current) fileInputRef.current.accept = "image/*"
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${mediaType === 'image' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                            <ImageIcon className="w-4 h-4" /> Image
                        </button>
                         <button 
                            type="button"
                            onClick={() => {
                                setMediaType("video")
                                if (fileInputRef.current) fileInputRef.current.accept = "video/*"
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full ${mediaType === 'video' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                        >
                            <Film className="w-4 h-4" /> Video
                        </button>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept={mediaType === "image" ? "image/*" : "video/*"}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                        <Upload className="w-5 h-5" />
                        Choose {mediaType === "image" ? "Image" : "Video"}
                    </button>
                    <p className="text-xs text-gray-500">Max size: 10MB</p>
                </div>
            ) : (
                <div className="relative">
                    <button 
                        type="button"
                        onClick={clearMedia}
                        className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70 z-10"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    {mediaType === "image" ? (
                        <Image 
                            src={previewUrl} 
                            alt="Preview" 
                            width={500}
                            height={384}
                            className="rounded-lg max-h-96 w-full object-cover" 
                        />
                    ) : (
                        <video src={previewUrl} controls className="rounded-lg max-h-96 w-full" />
                    )}
                </div>
            )}
        </div>
    )
}
