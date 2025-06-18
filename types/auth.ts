export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  provider: "google" | "facebook" | "email"
  createdAt: Date
  lastLoginAt: Date
  preferences?: {
    language: "en" | "bn"
    theme: "light" | "dark"
    notifications: boolean
  }
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface ProfileUpdateData {
  name?: string
  avatar?: File
  preferences?: Partial<User["preferences"]>
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}
