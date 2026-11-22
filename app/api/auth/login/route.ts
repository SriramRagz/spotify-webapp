import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ?? "http://spotify-backend:3001/api";

    const response = await fetch(`${backendUrl}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? "Login failed." },
        { status: response.status }
      );
    }

    const result = NextResponse.json({
      user: data.user,
      message: "Login successful.",
    });

    result.cookies.set("spotify_session", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expiresIn ?? 3600,
    });

    return result;
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the authentication service." },
      { status: 500 }
    );
  }
}
