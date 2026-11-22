import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL || "http://spotify-backend:3001/api";

async function forwardRequest(
  request: NextRequest,
  method: "GET" | "POST"
) {
  const token = request.cookies.get("spotify_session")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Please log in to access your library." },
      { status: 401 }
    );
  }

  try {
    const body = method === "POST" ? await request.json() : undefined;

    const response = await fetch(`${BACKEND_URL}/library/playlists`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to your music library." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return forwardRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return forwardRequest(request, "POST");
}
