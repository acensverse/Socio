"use client"

import { useState } from "react"
import Link from "next/link"
import { Twitter, Mail, Lock, User } from "lucide-react"
import { register } from "@/actions/auth"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    try {
      const result = await register(formData)
      if (result?.error) {
        setError(result.error)
      }
      // If successful, the server action will redirect to /profile
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-black p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
         <div className="flex flex-col items-center mb-8">
            <Twitter className="w-12 h-12 text-primary mb-4" fill="currentColor" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create an account</h1>
            <p className="text-gray-500 mt-2">Join our community today.</p>
         </div>

         {error && (
           <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
             {error}
           </div>
         )}

         <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      name="name"
                      type="text" 
                      placeholder="Jane Doe" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
                      required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      name="email"
                      type="email" 
                      placeholder="Enter your email" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
                      required
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-900 dark:text-white">Password</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      name="password"
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-3 pl-10 pr-4 outline-none focus:border-primary transition-colors"
                      required
                    />
                </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 bg-black text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
         </form>

         <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
         </p>
      </div>
    </div>
  )
}
