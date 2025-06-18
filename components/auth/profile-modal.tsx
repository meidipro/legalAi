"use client"

import type React from "react"
import { useState, useRef } from "react"
import { X, Camera, User, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import type { Language, ProfileUpdateData } from "@/types/auth"

interface ProfileModalProps {
  language: Language
  onClose: () => void
}

export function ProfileModal({ language, onClose }: ProfileModalProps) {
  const { user, updateProfile, logout, isLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatar: null as File | null,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError(language === "en" ? "File size must be less than 5MB" : "ফাইলের আকার ৫MB এর কম হতে হবে")
        return
      }

      setFormData((prev) => ({ ...prev, avatar: file }))

      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const updateData: ProfileUpdateData = {
        name: formData.name,
        preferences: {
          language,
          theme,
          notifications: user.preferences?.notifications ?? true,
        },
      }

      if (formData.avatar) {
        updateData.avatar = formData.avatar
      }

      await updateProfile(updateData)
      setSuccess(language === "en" ? "Profile updated successfully!" : "প্রোফাইল সফলভাবে আপডেট হয়েছে!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {language === "en" ? "Profile Settings" : "প্রোফাইল সেটিংস"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl || "/placeholder.svg"} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {language === "en" ? "Click to change profile picture" : "প্রোফাইল ছবি পরিবর্তন করতে ক্লিক করুন"}
              </p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === "en" ? "Full Name" : "পূর্ণ নাম"}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {language === "en" ? "Email" : "ইমেইল"}
              </label>
              <input
                type="email"
                value={user.email}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                disabled
              />
            </div>

            {/* Account Info */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                {language === "en" ? "Account Information" : "অ্যাকাউন্টের তথ্য"}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>{language === "en" ? "Provider:" : "প্রদানকারী:"}</span>
                  <span className="capitalize">{user.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "en" ? "Member since:" : "সদস্য হওয়ার তারিখ:"}</span>
                  <span>{user.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === "en" ? "Last login:" : "শেষ লগইন:"}</span>
                  <span>{user.lastLoginAt.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {language === "en" ? "Dark Mode" : "ডার্ক মোড"}
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === "dark" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                {language === "en" ? "Save Changes" : "পরিবর্তন সংরক্ষণ করুন"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-colors"
              >
                {language === "en" ? "Sign Out" : "সাইন আউট"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
