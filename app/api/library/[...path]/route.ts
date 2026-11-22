import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function forwardRequest(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("spotify_session")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Please log in to access your library." },
        { status: 401 }
      );
    }

    const backendUrl =
      process.env.BACKEND_URL || "http://spotify-backend:3001/api";

    const path = request.nextUrl.pathname.replace(
      /^\/api\/library\/?/,
      ""
    );

    const query = request.nextUrl.search;
    const body =
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : await request.text();

    const response = await fetch(
      `${backendUrl}/library/${path}${query}`,
      {
        method: request.method,
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        ...(body ? { body } : {}),
        cache: "no-store",
      }
    );

    const responseText = await response.text();

    if (!responseText) {
      return new NextResponse(null, { status: response.status });
    }

    try {
      return NextResponse.json(JSON.parse(responseText), {
        status: response.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
      });
    }
  } catch {
    return NextResponse.json(
      { message: "Unable to connect to your music library." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return forwardRequest(request);
}

export async function POST(request: NextRequest) {
  return forwardRequest(request);
}

export async function PATCH(request: NextRequest) {
  return forwardRequest(request);
}

export async function DELETE(request: NextRequest) {
  return forwardRequest(request);
}
