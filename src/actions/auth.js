"use server"

import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import fs from "fs"
import path from "path"

export async function register(formData) {
  const logFile = path.join(process.cwd(), "auth-debug.log")
  try {
    const name = formData.get("name")
    const email = formData.get("email")
    const password = formData.get("password")

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register START: ${email}\n`)

    if (!email || !password) {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register ERROR email or password\n`)
      return { error: "Email and password are required" }
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register ERROR exists ${email}\n`)
      return { error: "User already exists" }
    }

    const hashedPassword = await hash(password, 12)
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Password hashed\n`)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] User created in DB: ${user.id}\n`)

    // Auto-login after registration
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Calling signIn...\n`)
    await signIn("credentials", {
        email,
        password,
        redirectTo: "/profile"
    })

    fs.appendFileSync(logFile, `[${new Date().toISOString()}] signIn returned\n`)
    return { success: true }
  } catch (error) {
    if (error.digest?.startsWith("NEXT_REDIRECT") || error.message === "NEXT_REDIRECT") {
        fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register SUCCESS (Redirecting)\n`)
        throw error
    }
    
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Register CATCH: ${error.message}\nStack: ${error.stack}\n`)
    
    if (error instanceof AuthError) {
        return { error: "Registration successful but login failed. Please sign in manually." }
    }

    console.error("Registration error:", error)
    return { error: error.message || "Failed to register" }
  }
}

export async function login(formData) {
  const email = formData.get("email")
  const password = formData.get("password")

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/"
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" }
        default:
          return { error: "Something went wrong" }
      }
    }
    throw error
  }
}
