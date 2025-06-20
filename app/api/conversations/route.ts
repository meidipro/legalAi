// Filename: app/api/conversations/route.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// This is the GET function. It runs when your app asks for the conversation history.
export async function GET(request: Request) {
  const cookieStore = await cookies();

  // Create a Supabase client that can work in a server environment
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  // Get the current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all conversations from the database that belong to this user
  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false }); // Show newest first

  if (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(conversations);
}


// This is the POST function. It runs when your app wants to save a conversation.
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get the conversation data that the frontend sent
  const conversationData = await request.json();

  // Save the new conversation to the database, linking it to the current user
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      title: conversationData.title,
      persona: conversationData.persona,
      messages: conversationData.messages,
    })
    .select()
    .single(); // Return the newly created row

  if (error) {
    console.error("Error inserting conversation:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}