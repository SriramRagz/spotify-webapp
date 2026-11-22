import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL ?? "http://spotify-backend:3001/api";

    const response = await fetch(`${backendUrl}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message ?? "Unable to create your account." },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { message: "Account created successfully. Please log in." },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to the registration service." },
      { status: 500 }
    );
  }
}
