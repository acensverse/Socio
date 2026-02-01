"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Twitter, Mail, Lock } from "lucide-react"
import { signIn } from "next-auth/react"

import { login } from "@/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)

    try {
      const result = await login(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        router.push("/")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-black p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
         <div className="flex flex-col items-center mb-8">
            <Twitter className="w-12 h-12 text-primary mb-4" fill="currentColor" />
            <h1 className="text-2xl font-bold">Sign in to Socio</h1>
            <p className="text-gray-500 mt-2">Welcome back Please enter your details.</p>
         </div>

         {error && (
           <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-lg mb-4 text-sm">
             {error}
           </div>
         )}

         <form onSubmit={handleLogin} className="flex flex-col gap-4">
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

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-900 dark:text-white">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    <span>Remember me</span>
                </label>
                <Link href="#" className="text-primary hover:underline">Forgot password?</Link>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 bg-black text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
         </form>

         <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-black px-2 text-gray-500">Or continue with</span>
            </div>
         </div>

         <button 
           onClick={handleGoogleLogin}
           className="w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white font-medium py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
         >
            <Image 
              src="https://www.svgrepo.com/show/475656/google-color.svg" 
              alt="Google" 
              width={20}
              height={20}
            />
            Sign in with Google
         </button>

         <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">Sign up</Link>
         </p>
      </div>
    </div>
  )
}
