"use client"

import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground md:pl-0 pb-20 md:pb-0">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center gap-4">
        <Link href="/settings" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Terms and Conditions</h1>
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full prose dark:prose-invert">
        <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

        <h4>1. Acceptance of Terms</h4>
        <p>
          By accessing and using SocialApp, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h4>2. User Conduct</h4>
        <p>
          You agree to use Socio only for lawful purposes. You represent that you are of legal age to form a binding contract.
          You content must not contain any illegal, offensive, or harmful material.
        </p>

        <h4>3. Content Ownership</h4>
        <p>
          You retain all rights to the content you post. However, by posting, you grant Socio a non-exclusive license to use, 
          display, and distribute said content on the platform.
        </p>

        <h4>4. Termination</h4>
        <p>
          We reserve the right to terminate or suspend your account immediately, without prior notice or liability, 
          for any reason whatsoever, including without limitation if you breach the Terms.
        </p>

        <h4>5. Changes to Terms</h4>
        <p>
          Socio reserves the right to change these conditions from time to time as it sees fit and your continued 
          use of the site will signify your acceptance of any adjustment to these terms.
        </p>
      </div>
    </div>
  )
}
