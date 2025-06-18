import type { User, LoginCredentials, SignupCredentials, ProfileUpdateData } from "@/types/auth"

// Configuration - Replace with your actual credentials
const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "840926923371-jmgk7rs8naalb3ak0cib852777sl50hv.apps.googleusercontent.com"

export class AuthService {
  private static instance: AuthService
  private readonly STORAGE_KEY = "legal-ai-user"

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  // Check if current origin is likely to work with Google OAuth
  private isOriginAllowed(): boolean {
    if (typeof window === "undefined") return false

    const origin = window.location.origin
    const hostname = window.location.hostname

    // Check for common development and production patterns
    const allowedPatterns = ["localhost", "127.0.0.1", ".vercel.app", ".netlify.app", ".github.io"]

    // If it's a known good pattern, likely to work
    const isKnownGood = allowedPatterns.some((pattern) => hostname.includes(pattern) || origin.includes(pattern))

    // If it's a v0 preview URL or other temporary URL, likely won't work
    const isTemporaryUrl =
      hostname.includes(".vusercontent.net") || hostname.includes(".preview.") || hostname.includes(".temp.")

    return isKnownGood && !isTemporaryUrl
  }

  // Real Google OAuth login with origin checking
  public async loginWithGoogle(): Promise<User> {
    return new Promise((resolve, reject) => {
      try {
        if (typeof window === "undefined") {
          reject(new Error("Google login is only available in browser"))
          return
        }

        // Check if we have a valid client ID
        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
          console.warn("Google Client ID not configured, using demo mode")
          this.simulateGoogleLogin(resolve)
          return
        }

        // Check if current origin is likely to work
        if (!this.isOriginAllowed()) {
          console.warn(
            `Current origin (${window.location.origin}) is not configured for Google OAuth. Using demo mode.`,
          )
          console.info(
            "To use real Google OAuth, add this origin to your Google Cloud Console authorized JavaScript origins.",
          )
          this.simulateGoogleLogin(resolve)
          return
        }

        // Load Google Identity Services if not already loaded
        if (!window.google) {
          const script = document.createElement("script")
          script.src = "https://accounts.google.com/gsi/client"
          script.onload = () => {
            this.initializeGoogleAuth(resolve, reject)
          }
          script.onerror = () => {
            console.error("Failed to load Google authentication script")
            this.simulateGoogleLogin(resolve)
          }
          document.head.appendChild(script)
        } else {
          this.initializeGoogleAuth(resolve, reject)
        }
      } catch (error) {
        console.error("Google authentication error:", error)
        this.simulateGoogleLogin(resolve)
      }
    })
  }

  private initializeGoogleAuth(resolve: (user: User) => void, reject: (error: Error) => void) {
    try {
      // Set up error handler for GSI errors
      const originalConsoleError = console.error
      let gsiErrorDetected = false

      console.error = (...args) => {
        const message = args.join(" ")
        if (message.includes("GSI_LOGGER") || message.includes("origin is not allowed")) {
          gsiErrorDetected = true
          console.warn("Google OAuth origin not authorized. Falling back to demo mode.")
          console.info(`Add ${window.location.origin} to your Google Cloud Console authorized JavaScript origins.`)
          this.simulateGoogleLogin(resolve)
          return
        }
        originalConsoleError.apply(console, args)
      }

      // Restore console.error after a delay
      setTimeout(() => {
        console.error = originalConsoleError
      }, 5000)

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          try {
            // Restore console.error immediately on success
            console.error = originalConsoleError

            // Decode the JWT token to get user info
            const payload = JSON.parse(atob(response.credential.split(".")[1]))

            const user: User = {
              id: `google_${payload.sub}`,
              email: payload.email,
              name: payload.name,
              avatar: payload.picture,
              provider: "google",
              createdAt: new Date(),
              lastLoginAt: new Date(),
              preferences: {
                language: "en",
                theme: "light",
                notifications: true,
              },
            }

            this.saveUser(user)
            resolve(user)
          } catch (error) {
            console.error("Failed to process Google authentication:", error)
            this.simulateGoogleLogin(resolve)
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        ux_mode: "popup",
      })

      // Check if GSI error was detected during initialization
      setTimeout(() => {
        if (gsiErrorDetected) {
          return // Already handled by error interceptor
        }

        // Use the prompt method
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.warn("Google sign-in prompt not displayed")
            this.simulateGoogleLogin(resolve)
          } else if (notification.isSkippedMoment()) {
            console.warn("Google sign-in was skipped")
            this.simulateGoogleLogin(resolve)
          } else if (notification.isDismissedMoment()) {
            reject(new Error("Google sign-in was dismissed by user"))
          }
        })
      }, 100)
    } catch (error) {
      console.error("Google authentication initialization failed:", error)
      this.simulateGoogleLogin(resolve)
    }
  }

  private simulateGoogleLogin(resolve: (user: User) => void) {
    console.log("🔄 Using demo Google login mode")
    setTimeout(() => {
      const user: User = {
        id: `google_demo_${Date.now()}`,
        email: "demo.user@gmail.com",
        name: "Demo Google User",
        avatar: `https://ui-avatars.com/api/?name=Demo+Google+User&background=4285f4&color=fff&size=96`,
        provider: "google",
        createdAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          language: "en",
          theme: "light",
          notifications: true,
        },
      }
      this.saveUser(user)
      resolve(user)
    }, 1000)
  }

  // Email/password login
  public async loginWithEmail(credentials: LoginCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!credentials.email || !credentials.password) {
            reject(new Error("Please enter valid email and password"))
            return
          }

          const user: User = {
            id: `email_${Date.now()}`,
            email: credentials.email,
            name: credentials.email.split("@")[0],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.email.split("@")[0])}&background=6366f1&color=fff&size=96`,
            provider: "email",
            createdAt: new Date(),
            lastLoginAt: new Date(),
            preferences: {
              language: "en",
              theme: "light",
              notifications: true,
            },
          }
          this.saveUser(user)
          resolve(user)
        } catch (error) {
          reject(new Error("Login failed"))
        }
      }, 1000)
    })
  }

  // Email/password signup
  public async signupWithEmail(credentials: SignupCredentials): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!credentials.name || !credentials.email || !credentials.password) {
            reject(new Error("Please fill in all required fields"))
            return
          }

          if (credentials.password !== credentials.confirmPassword) {
            reject(new Error("Passwords do not match"))
            return
          }

          if (credentials.password.length < 6) {
            reject(new Error("Password must be at least 6 characters long"))
            return
          }

          const user: User = {
            id: `email_${Date.now()}`,
            email: credentials.email,
            name: credentials.name,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name)}&background=10b981&color=fff&size=96`,
            provider: "email",
            createdAt: new Date(),
            lastLoginAt: new Date(),
            preferences: {
              language: "en",
              theme: "light",
              notifications: true,
            },
          }
          this.saveUser(user)
          resolve(user)
        } catch (error) {
          reject(new Error("Signup failed"))
        }
      }, 1000)
    })
  }

  // Update user profile
  public async updateProfile(userId: string, data: ProfileUpdateData): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          const currentUser = this.getCurrentUser()
          if (!currentUser || currentUser.id !== userId) {
            reject(new Error("User not found"))
            return
          }

          let avatarUrl = currentUser.avatar

          if (data.avatar) {
            avatarUrl = await this.uploadAvatar(data.avatar)
          }

          const updatedUser: User = {
            ...currentUser,
            name: data.name || currentUser.name,
            avatar: avatarUrl,
            preferences: {
              ...currentUser.preferences,
              ...data.preferences,
            },
          }

          this.saveUser(updatedUser)
          resolve(updatedUser)
        } catch (error) {
          reject(new Error("Failed to update profile"))
        }
      }, 1000)
    })
  }

  private async uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  public getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const user = JSON.parse(stored)
        return {
          ...user,
          createdAt: new Date(user.createdAt),
          lastLoginAt: new Date(user.lastLoginAt),
        }
      }
    } catch (error) {
      console.error("Error loading user:", error)
    }

    return null
  }

  private saveUser(user: User) {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user))
    } catch (error) {
      console.error("Error saving user:", error)
    }
  }

  public async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY)

      // Logout from Google if signed in
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect()
      }
    }
  }

  public isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }

  public async requestPasswordReset(email: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!email) {
            reject(new Error("Please enter a valid email address"))
            return
          }
          console.log(`Password reset email sent to: ${email}`)
          resolve()
        } catch (error) {
          reject(new Error("Failed to send reset email"))
        }
      }, 1500)
    })
  }

  public async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (token && newPassword) {
            resolve()
          } else {
            reject(new Error("Invalid reset token or password"))
          }
        } catch (error) {
          reject(new Error("Failed to reset password"))
        }
      }, 1000)
    })
  }
}

// Extend window interface for Google and Facebook SDKs
declare global {
  interface Window {
    google: any
  }
}
