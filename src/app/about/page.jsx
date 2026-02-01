"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground md:pl-0 pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">About</h1>
      </div>

      {/* Content */}
      <div className="p-6 max-w-2xl mx-auto w-full prose dark:prose-invert">
        <h2>Welcome to Socio</h2>
        <p>
          <strong>Socio</strong> is a modern, next-generation social media platform
          built to deliver a smooth, intuitive, and visually refined user experience.
          It is designed for people who value clean design, meaningful interactions,
          and fast performance across devices.
        </p>

        <p>
          Unlike cluttered and outdated platforms, Socio focuses on simplicity,
          speed, and usability — allowing users to share moments, engage with content,
          and connect with others in a distraction-free environment.
        </p>

        <h3>Our Vision</h3>
        <p>
          The vision behind Socio is to create a social space that feels premium,
          respectful, and user-centric. We aim to bridge the gap between powerful
          technology and human connection while keeping privacy, transparency,
          and design quality at the core.
        </p>

        <h3>What Makes Socip Different</h3>
        <ul>
          <li>⚡ High-performance and responsive interface</li>
          <li>🎨 Best-in-class UI/UX with modern design principles</li>
          <li>🔒 Privacy-first and user-focused approach</li>
          <li>📱 Optimized for both web and mobile experiences</li>
          <li>🧩 Clean architecture built using modern frameworks</li>
        </ul>

        <h3>Technology & Design</h3>
        <p>
          Socio is crafted using modern web technologies to ensure scalability,
          maintainability, and performance. Every component is carefully designed
          with attention to detail, smooth interactions, and visual consistency.
        </p>

        <h3>Credits</h3>
        <p>
          This application is proudly <strong>designed and developed by Acens</strong>.
          The project reflects a strong focus on <strong>best UI/UX practices</strong>,
          clean code structure, and a premium user experience.
        </p>

        <h3>Version</h3>
        <p>v1.0.0 (Alpha)</p>

        <div className="mt-10 pt-8 border-t border-gray-100 dark:border-zinc-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Socio.  
          <br />
          Built with passion by <strong>Acens</strong>.
        </div>
      </div>
    </div>
  )
}
