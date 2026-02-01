"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground md:pl-0 pb-20 md:pb-0">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-4">
        <Link href="/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Privacy Policy</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full prose dark:prose-invert">
        <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <h4>1. Information Collection</h4>
        <p>
          We collect information you provide directly to us, such as when you create an account, update your profile, 
          post content, or interact with other users.
        </p>

        <h4>2. How We Use Information</h4>
        <p>
          We use the information we collect to provide, maintain, and improve our services, to develop new ones, 
          and to protect Socio and our users.
        </p>

        <h4>3. Information Sharing</h4>
        <p>
          We do not share your personal information with companies, organizations, or individuals outside of SocialApp 
          except in strict compliance with the law or to protect our rights.
        </p>

        <h4>4. Data Security</h4>
        <p>
          We work hard to protect Socio and our users from unauthorized access to or unauthorized alteration, 
          disclosure, or destruction of information we hold.
        </p>

        <h4>5. Your Privacy Rights</h4>
        <p>
          You have the right to access, correct, or delete your personal data. You can manage your information 
          through your account settings.
        </p>
      </div>
    </div>
  )
}
