// Filename: app/api/profile/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// This handles PATCH requests to update a user's profile
export async function PATCH(request: Request) {
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

  const { name } = await request.json();

  // 1. Update the 'profiles' table in your database
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: name })
    .eq('id', user.id);

  if (profileError) {
    return NextResponse.json({ error: `Database error: ${profileError.message}` }, { status: 500 });
  }

  // 2. Also update the user's metadata in the main 'auth' system
  const { data: { user: updatedUser }, error: userError } = await supabase.auth.updateUser({
    data: { name: name }
  });

  if (userError) {
    return NextResponse.json({ error: `Auth error: ${userError.message}` }, { status: 500 });
  }

  return NextResponse.json(updatedUser);
}