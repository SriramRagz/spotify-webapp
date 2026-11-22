"use client";

import { useEffect, useState } from "react";
import AccountMenu from "./components/AccountMenu";
import AudioPlayer from "./components/AudioPlayer";
import LibraryPanel from "./components/LibraryPanel";

type Track = {
  id: string;
  title: string;
  durationMs: number;
  artists: { id: string; name: string }[];
  album?: { title: string } | null;
  genres?: { name: string }[];
};

const visuals = [
  { color: "from-purple-700 to-indigo-950", icon: "🌙" },
  { color: "from-orange-500 to-rose-900", icon: "🌅" },
  { color: "from-cyan-600 to-blue-950", icon: "🌊" },
  { color: "from-emerald-600 to-teal-950", icon: "🌿" },
  { color: "from-pink-600 to-purple-950", icon: "⚡" },
  { color: "from-slate-500 to-slate-950", icon: "🌃" },
];

export default function Home() {
  const [songs, setSongs] = useState<Track[]>([]);
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadTracks() {
      try {
        const response = await fetch("/api/catalog/tracks", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load music catalogue.");
        }

        const data: Track[] = await response.json();
        setSongs(data);

        if (data.length > 0) {
          setActiveSongId(data[0].id);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadTracks();

    return () => controller.abort();
  }, []);

  const activeSong =
    songs.find((song) => song.id === activeSongId) ?? songs[0] ?? null;

  const filteredSongs = songs.filter((song) => {
    const artistNames = song.artists.map((artist) => artist.name).join(" ");
    return `${song.title} ${artistNames}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  function playSong(song: Track) {
    setActiveSongId(song.id);
    setIsPlaying(true);
  }

  function changeTrack(direction: number) {
    if (songs.length === 0 || !activeSong) return;

    const currentIndex = songs.findIndex(
      (song) => song.id === activeSong.id
    );

    const nextIndex =
      (currentIndex + direction + songs.length) % songs.length;

    setActiveSongId(songs[nextIndex].id);
    setIsPlaying(true);
  }

  return (
    <main className="min-h-screen bg-[#080b0a] pb-28 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 flex-col bg-black p-6 md:flex">
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
              <h2 className="mt-1 text-3xl font-bold">
                Your music, your mood.
              </h2>
            </div>
            <AccountMenu />
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
                if (songs.length > 0) playSong(songs[0]);
              }}
              disabled={songs.length === 0}
              className="mt-7 rounded-full bg-green-400 px-7 py-3 font-bold text-black hover:bg-green-300 disabled:opacity-50"
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

            {loading && (
              <p className="py-8 text-sm text-gray-400">
                Loading your music catalogue...
              </p>
            )}

            {error && (
              <p className="py-8 text-sm text-red-400">
                {error} Please refresh the page and try again.
              </p>
            )}

            {!loading && !error && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {filteredSongs.map((song, index) => {
                  const visual = visuals[index % visuals.length];
                  const artistNames = song.artists
                    .map((artist) => artist.name)
                    .join(", ");

                  return (
                    <button
                      key={song.id}
                      onClick={() => playSong(song)}
                      className="group rounded-xl bg-[#141a16] p-3 text-left transition hover:bg-[#222b25]"
                    >
                      <div
                        className={`mb-4 flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br ${visual.color}`}
                      >
                        <span className="text-5xl">{visual.icon}</span>
                      </div>
                      <p className="truncate text-sm font-bold">
                        {song.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {artistNames || "Unknown artist"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && !error && filteredSongs.length === 0 && (
              <p className="py-8 text-sm text-gray-400">
                No matching tracks found. Try another search.
              </p>
            )}
          </div>
          <LibraryPanel tracks={songs} />
        </section>
      </div>

      <AudioPlayer
        track={activeSong}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying((current) => !current)}
        onPrevious={() => changeTrack(-1)}
        onNext={() => changeTrack(1)}
      />
    </main>
  );
}
