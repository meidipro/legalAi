// Filename: app/api/conversations/route.ts (DEFINITIVE FIX)

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// --- GET Request: Fetches all conversations for the logged-in user ---
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized: No user session found." }), { status: 401 });
  }

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(conversations);
}

// --- POST Request: Saves or updates a conversation ---
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized: No user session found." }), { status: 401 });
  }

  const conversationData = await request.json();

  // Use upsert: it updates if a matching ID is found, or inserts if not.
  const { data, error } = await supabase
    .from("conversations")
    .upsert({
      id: conversationData.id, // Supabase can use a provided ID or generate one
      user_id: user.id,
      title: conversationData.title,
      persona: conversationData.persona,
      messages: conversationData.messages,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: `Supabase error: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json(data);
}