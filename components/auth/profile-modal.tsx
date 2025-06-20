// Filename: components/auth/profile-modal.tsx (UPDATED)

"use client"

import type React from "react"
import { useState, useRef } from "react"
import { X, Camera, User, Save, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/contexts/theme-context"
import { supabase } from "@/lib/supabase-client"; // <-- Import Supabase client
import type { ProfileUpdateData } from "@/types/auth";
import type { Language } from "@/types/chat";

interface ProfileModalProps {
  language: Language
  onClose: () => void
}

export function ProfileModal({ language, onClose }: ProfileModalProps) {
  const { user, logout, isLoading: isAuthLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  
  const [name, setName] = useState(user?.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar || null)
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) return null

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setError("File size must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsUploading(true);

    try {
      // Step 1: Upload new avatar if one was selected
      if (avatarFile) {
        const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update the user's avatar_url metadata in Supabase Auth
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      }

      // Step 2: Update the user's name via our API
      if (name !== user.name) {
          const response = await fetch('/api/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name }),
          });
          if (!response.ok) {
              const { error } = await response.json();
              throw new Error(error || "Failed to update profile name.");
          }
      }
      
      setSuccess("Profile updated successfully!");
      // Optionally, you may want to trigger a user data refresh here if your context supports it.
      
      // Optional: Close modal after a short delay
      setTimeout(() => onClose(), 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsUploading(false);
    }
  }

  const handleLogout = async () => {
    await logout();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Settings</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {previewUrl ? <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input type="email" value={user.email} className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100" disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <button type="button" onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <div className="space-y-3 pt-4 border-t">
              <button type="submit" disabled={isUploading || isAuthLoading} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center gap-2">
                {(isUploading || isAuthLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button type="button" onClick={handleLogout} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg">
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}