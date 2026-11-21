
"use client";

import { useState } from "react";

const songs = [
  { title: "Midnight Dreams", artist: "The Weekenders", color: "from-purple-700 to-indigo-950", icon: "🌙" },
  { title: "Golden Hour", artist: "Sunset Collective", color: "from-orange-500 to-rose-900", icon: "🌅" },
  { title: "Ocean Waves", artist: "Blue Horizon", color: "from-cyan-600 to-blue-950", icon: "🌊" },
  { title: "Electric Soul", artist: "Neon Avenue", color: "from-pink-600 to-purple-950", icon: "⚡" },
  { title: "Calm Mornings", artist: "Acoustic Stories", color: "from-emerald-600 to-teal-950", icon: "🌿" },
  { title: "City Lights", artist: "Urban Echo", color: "from-slate-500 to-slate-950", icon: "🌃" },
];

export default function Home() {
  const [activeSong, setActiveSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [search, setSearch] = useState("");

  const filteredSongs = songs.filter((song) =>
    `${song.title} ${song.artist}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#080b0a] text-white pb-28">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col bg-black p-6">
          <h1 className="mb-10 text-2xl font-bold tracking-tight text-green-400">
            soundwave<span className="text-white">.</span>
          </h1>

          <nav className="space-y-6 text-sm font-semibold">
            <a href="#" className="block text-white">⌂ Home</a>
            <a href="#search" className="block text-gray-400 hover:text-white">⌕ Search</a>
            <a href="#library" className="block text-gray-400 hover:text-white">▤ Your Library</a>
          </nav>

          <div className="mt-12">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-gray-500">
              Your collection
            </p>
            <div className="space-y-4 text-sm text-gray-400">
              <p>♡ Liked Songs</p>
              <p>♫ Recently Played</p>
              <p>＋ Create Playlist</p>
            </div>
          </div>

          <div className="mt-auto rounded-xl bg-[#14231b] p-4">
            <p className="text-sm font-semibold text-green-300">Discover music</p>
            <p className="mt-2 text-xs leading-5 text-gray-400">
              Find your next favourite sound.
            </p>
          </div>
        </aside>

        {/* Main dashboard */}
        <section className="min-w-0 flex-1 px-5 py-7 md:px-10">

          <header className="mb-10 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Welcome back</p>
              <h2 className="mt-1 text-3xl font-bold">Your music, your mood.</h2>
            </div>
            <div className="hidden rounded-full bg-[#202723] px-5 py-3 text-sm text-gray-300 sm:block">
              Sriram's Music Space
            </div>
          </header>

          {/* Featured banner */}
          <div className="mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 via-emerald-900 to-[#14231b] p-7 md:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-green-300">
              Your daily soundtrack
            </p>
            <h3 className="mt-4 max-w-lg text-3xl font-bold md:text-5xl">
              Every moment deserves a soundtrack.
            </h3>
            <p className="mt-4 text-sm text-gray-200">
              Explore music for every mood and moment.
            </p>
            <button
              onClick={() => {
                setActiveSong(songs[0]);
                setIsPlaying(true);
              }}
              className="mt-7 rounded-full bg-green-400 px-7 py-3 font-bold text-black hover:bg-green-300"
            >
              ▶ Explore music
            </button>
          </div>

          {/* Search */}
          <div id="search" className="mb-10">
            <h3 className="mb-4 text-xl font-bold">Find your sound</h3>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search songs or artists..."
              className="w-full max-w-xl rounded-full border border-gray-700 bg-[#171d19] px-5 py-3 text-sm outline-none focus:border-green-400"
            />
          </div>

          {/* Music collection */}
          <div id="library">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-bold">Made for your mood</h3>
              <span className="text-xs text-gray-500">
                {filteredSongs.length} tracks
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {filteredSongs.map((song) => (
                <button
                  key={song.title}
                  onClick={() => {
                    setActiveSong(song);
                    setIsPlaying(true);
                  }}
                  className="group rounded-xl bg-[#141a16] p-3 text-left transition hover:bg-[#222b25]"
                >
                  <div className={`mb-4 flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br ${song.color}`}>
                    <span className="text-5xl">{song.icon}</span>
                  </div>
                  <p className="truncate text-sm font-bold">{song.title}</p>
                  <p className="mt-1 truncate text-xs text-gray-400">{song.artist}</p>
                </button>
              ))}
            </div>

            {filteredSongs.length === 0 && (
              <p className="py-8 text-sm text-gray-400">
                No matching tracks found. Try another search.
              </p>
            )}
          </div>

        </section>
      </div>

      {/* Bottom music player */}
      <footer className="fixed bottom-0 left-0 z-10 flex w-full items-center justify-between border-t border-gray-800 bg-[#111713] px-4 py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-blue-900 text-2xl">
            {activeSong.icon}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{activeSong.title}</p>
            <p className="truncate text-xs text-gray-400">{activeSong.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button className="text-gray-400 hover:text-white" aria-label="Previous">|◀</button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-black hover:scale-105"
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>
          <button className="text-gray-400 hover:text-white" aria-label="Next">▶|</button>
        </div>

        <div className="hidden text-xs text-gray-400 sm:block">
          {isPlaying ? "Playing preview mode" : "Ready to play"}
        </div>
      </footer>
    </main>
  );
}
