import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("spotify_session")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 }
    );
  }

  try {
    const backendUrl =
      process.env.BACKEND_URL || "http://spotify-backend:3001";

    const response = await fetch(`${backendUrl}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: "Session expired or invalid." },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: data });
  } catch {
    return NextResponse.json(
      { message: "Unable to verify session." },
      { status: 500 }
    );
  }
}
