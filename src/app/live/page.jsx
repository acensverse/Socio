"use client"

import { useState } from "react"
import { Radio, Search, Users, PlayCircle, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockLiveStreams, LiveStream } from "@/components/live/mockData"
import { LiveStreamCard } from "@/components/live/LiveStreamCard"
import { LiveView } from "@/components/live/LiveView"


export default function LivePage() {
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedStream, setSelectedStream] = useState(null)

  const filteredStreams = mockLiveStreams.filter(stream => stream.category === activeTab)

  return (
    <div className="h-screen bg-background overflow-hidden pb-20 md:pb-0 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 md:p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-red-500 p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg shadow-red-500/20">
                <Radio className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">Live Streams</h1>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Experience in real-time</p>
            </div>
        </div>
        
        <div className="flex w-full md:w-auto bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl md:p-1.5 md:rounded-2xl border border-gray-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
            {[
                { id: 'discover', label: 'Discover', icon: Radio },
                { id: 'following', label: 'Following', icon: Users },
                { id: 'previous', label: 'Previous', icon: History }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                        "flex items-center justify-center gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex-1 md:flex-none whitespace-nowrap",
                        activeTab === tab.id 
                            ? "bg-white dark:bg-zinc-800 text-red-500 shadow-xl shadow-black/5 dark:shadow-white/5" 
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    )}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        {filteredStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {filteredStreams.map(stream => (
                    <LiveStreamCard 
                        key={stream.id} 
                        stream={stream} 
                        onClick={setSelectedStream}
                    />
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto min-h-[50vh]">
                <div className="relative mb-10">
                    <div className="absolute inset-0 bg-red-500/20 blur-[100px] rounded-full scale-150 animate-pulse" />
                    <div className="relative bg-white dark:bg-zinc-900 p-10 rounded-[40px] shadow-2xl border border-gray-100 dark:border-zinc-800">
                        <Radio className="w-20 h-20 text-red-500 mb-6 mx-auto" strokeWidth={2.5} />
                        <div className="flex items-center gap-3 justify-center bg-red-500 text-white text-[11px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em] animate-pulse">
                            <span className="w-2 h-2 bg-white rounded-full" />
                            Nothing Streaming
                        </div>
                    </div>
                </div>

                <h2 className="text-4xl font-black mb-4 tracking-tighter">Everything is quiet...</h2>
                <p className="text-gray-500 dark:text-gray-400 text-xl leading-relaxed font-medium">
                No active streams in this category. Follow your favorite creators to get notified when they go live
                </p>
            </div>
        )}
      </div>

      {/* Live Stream View Overlay */}
      {selectedStream && (
        <LiveView 
            stream={selectedStream} 
            onClose={() => setSelectedStream(null)} 
        />
      )}
    </div>
  )
}
