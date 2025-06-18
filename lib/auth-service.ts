// Filename: lib/auth-service.ts (NEW AND IMPROVED)

import { supabase } from './supabase-client';
import type { User as AppUser, LoginCredentials, SignupCredentials, ProfileUpdateData } from "@/types/auth";
import type { User as SupabaseUser } from '@supabase/supabase-js';

// This is a singleton class, meaning there's only one instance of it in the entire app.
export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // This is a helper function. It takes a user object from Supabase
  // and converts it into the format that our application understands (from types/auth.ts).
  private adaptSupabaseUser(supabaseUser: SupabaseUser): AppUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || "User",
      avatar: supabaseUser.user_metadata?.avatar_url,
      provider: (["email", "google", "facebook"].includes(supabaseUser.app_metadata.provider ?? "email")
        ? (supabaseUser.app_metadata.provider ?? "email")
        : "email") as "email" | "google" | "facebook",
      createdAt: new Date(supabaseUser.created_at),
      lastLoginAt: new Date(supabaseUser.last_sign_in_at || Date.now()),
      // We will add real preferences later when we have a database table for them.
      preferences: {
        language: "en",
        theme: "light",
        notifications: true,
      },
    };
  }

  // --- Core Authentication Methods ---

  public async signupWithEmail(credentials: SignupCredentials): Promise<AppUser> {
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          // We provide a default avatar image on signup.
          avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(credentials.name)}&background=10b981&color=fff&size=96`,
        }
      }
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Signup failed: No user returned.");
    return this.adaptSupabaseUser(data.user);
  }

  public async loginWithEmail(credentials: LoginCredentials): Promise<AppUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Login failed: No user returned.");
    return this.adaptSupabaseUser(data.user);
  }

  public async loginWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // After logging in with Google, send the user back to the app's homepage.
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      throw new Error(`Google login failed: ${error.message}`);
    }
    // This function doesn't return a user because the page will redirect to Google.
  }

  public async logout(): Promise<void> {
    await supabase.auth.signOut();
  }


  // --- Session and State Management ---

  public async getCurrentUser(): Promise<AppUser | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return this.adaptSupabaseUser(session.user);
    }
    return null;
  }

  // This function sets up a listener that automatically detects when a user logs in or out.
  public onAuthStateChange(callback: (user: AppUser | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ? this.adaptSupabaseUser(session.user) : null;
      callback(user);
    });

    return subscription;
  }
}