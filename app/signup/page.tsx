"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(" ")
            : data.message ?? "Registration failed."
        );
      }

      router.push("/login?registered=1");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b0a] px-5 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-[#121915] p-8 shadow-2xl">
        <Link href="/" className="block text-center text-3xl font-bold text-green-400">
          soundwave<span className="text-white">.</span>
        </Link>

        <h1 className="mt-8 text-center text-2xl font-bold">Create your account</h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign up and start building your music collection.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm">Your name</label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-lg border border-gray-700 bg-[#080b0a] px-4 py-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-gray-700 bg-[#080b0a] px-4 py-3 outline-none focus:border-green-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-gray-700 bg-[#080b0a] px-4 py-3 outline-none focus:border-green-400"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-950/70 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-green-400 py-3 font-bold text-black transition hover:bg-green-300 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
