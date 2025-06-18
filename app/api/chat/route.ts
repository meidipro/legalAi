// Filename: app/api/chat/route.ts

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Read the incoming data from the frontend
  const { inputs, query, conversation_id, user } = await request.json();

  // 2. Get the secret API key from the server's environment variables
  const difyApiKey = process.env.DIFY_API_KEY;

  // 3. Safety check: Ensure the key is available
  if (!difyApiKey) {
    return NextResponse.json(
      { error: "Server API key not configured." },
      { status: 500 }
    );
  }

  const DIFY_API_ENDPOINT = "https://api.dify.ai/v1/chat-messages";

  try {
    // 4. Securely call the Dify API from your server
    const response = await fetch(DIFY_API_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${difyApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: inputs,
        query: query,
        response_mode: "streaming",
        user: user || "anonymous-user", // Use the user identifier or a fallback
        conversation_id: conversation_id || "",
      }),
    });

    // 5. Check if Dify returned an error
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Dify API Error:", errorData);
        return NextResponse.json(
            { error: `Dify API error: ${errorData.message || response.statusText}` },
            { status: response.status }
        );
    }

    // 6. If successful, stream the response back to the frontend
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 }
    );
  }
}