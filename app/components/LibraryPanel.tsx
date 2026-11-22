"use client";

import { useCallback, useEffect, useState } from "react";

type Track = {
  id: string;
  title: string;
  artists: { id: string; name: string }[];
};

type Playlist = {
  id: string;
  name: string;
  description?: string | null;
  track_count?: number;
  is_public?: boolean;
};

export default function LibraryPanel({ tracks }: { tracks: Track[] }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [name, setName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadPlaylists = useCallback(async () => {
    const response = await fetch("/api/library/playlists", {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Unable to load playlists.");

    const data = await response.json();
    setPlaylists(Array.isArray(data) ? data : []);
  }, []);

  const loadLikedTracks = useCallback(async () => {
    const response = await fetch("/api/library/liked-tracks", {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Unable to load liked songs.");

    const data = await response.json();
    setLikedTracks(Array.isArray(data) ? data : []);
  }, []);

  const refreshLibrary = useCallback(async () => {
    try {
      await Promise.all([loadPlaylists(), loadLikedTracks()]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load your library."
      );
    }
  }, [loadPlaylists, loadLikedTracks]);

  useEffect(() => {
    void refreshLibrary();
  }, [refreshLibrary]);

  async function createPlaylist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/library/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: "Created in Soundwave",
          isPublic: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Playlist creation failed.");
      }

      setName("");
      setMessage("Playlist created successfully.");
      if (data.id) setSelectedPlaylist(data.id);
      await loadPlaylists();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function addTrack(trackId: string) {
    if (!selectedPlaylist) {
      setMessage("Create or select a playlist first.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/library/playlists/${selectedPlaylist}/tracks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackId }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to add this track.");
      }

      setMessage("Track added to your playlist.");
      await loadPlaylists();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleLike(track: Track) {
    const alreadyLiked = likedTracks.some((item) => item.id === track.id);
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/library/liked-tracks/${track.id}`,
        { method: alreadyLiked ? "DELETE" : "POST" }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to update liked songs.");
      }

      await loadLikedTracks();
      setMessage(alreadyLiked ? "Track removed from Liked Songs." : "Track added to Liked Songs.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-12 border-t border-gray-800 pt-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-green-400">
          Your collection
        </p>
        <h2 className="mt-2 text-2xl font-bold">Your Library</h2>
        <p className="mt-1 text-sm text-gray-400">
          Manage playlists and save the music you love.
        </p>
      </div>

      <form onSubmit={createPlaylist} className="mb-7 flex flex-wrap gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Give your playlist a name"
          maxLength={100}
          className="min-w-0 flex-1 rounded-lg border border-gray-700 bg-[#171d19] px-4 py-3 text-sm outline-none focus:border-green-400"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="rounded-full bg-green-400 px-6 py-3 text-sm font-bold text-black hover:bg-green-300 disabled:opacity-50"
        >
          Create Playlist
        </button>
      </form>

      {message && (
        <p role="status" className="mb-5 text-sm text-green-300">
          {message}
        </p>
      )}

      <h3 className="mb-4 font-semibold">Your Playlists</h3>

      {playlists.length === 0 ? (
        <p className="mb-7 rounded-xl bg-[#141a16] p-5 text-sm text-gray-400">
          No playlists yet. Create your first playlist above.
        </p>
      ) : (
        <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <button
              type="button"
              key={playlist.id}
              onClick={() => setSelectedPlaylist(playlist.id)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedPlaylist === playlist.id
                  ? "border-green-400 bg-[#1b2b20]"
                  : "border-gray-800 bg-[#141a16] hover:bg-[#202923]"
              }`}
            >
              <p className="truncate font-semibold">{playlist.name}</p>
              <p className="mt-2 text-xs text-gray-400">
                {playlist.track_count ?? 0} tracks
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Add music to a playlist</h3>
        <select
          value={selectedPlaylist}
          onChange={(event) => setSelectedPlaylist(event.target.value)}
          className="max-w-full rounded-lg border border-gray-700 bg-[#171d19] px-3 py-2 text-sm"
        >
          <option value="">Select a playlist</option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>
              {playlist.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-10 divide-y divide-gray-800 rounded-xl bg-[#141a16]">
        {tracks.map((track) => {
          const liked = likedTracks.some((item) => item.id === track.id);

          return (
            <div
              key={track.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{track.title}</p>
                <p className="truncate text-xs text-gray-400">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleLike(track)}
                  aria-label={liked ? "Unlike track" : "Like track"}
                  className={`rounded-full px-3 py-2 text-sm ${
                    liked ? "text-green-400" : "text-gray-400 hover:text-green-400"
                  }`}
                >
                  {liked ? "♥" : "♡"}
                </button>
                <button
                  type="button"
                  disabled={busy || playlists.length === 0}
                  onClick={() => addTrack(track.id)}
                  className="rounded-full border border-gray-600 px-4 py-2 text-xs font-semibold hover:border-green-400 hover:text-green-400 disabled:opacity-40"
                >
                  + Add
                </button>
              </div>
            </div>
          );
        })}
        {tracks.length === 0 && (
          <p className="p-4 text-sm text-gray-400">
            No catalogue tracks available.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-4 font-semibold">♥ Liked Songs</h3>
        {likedTracks.length === 0 ? (
          <p className="rounded-xl bg-[#141a16] p-5 text-sm text-gray-400">
            Your liked songs will appear here.
          </p>
        ) : (
          <div className="divide-y divide-gray-800 rounded-xl bg-[#141a16]">
            {likedTracks.map((track) => (
              <div key={track.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{track.title}</p>
                  <p className="truncate text-xs text-gray-400">
                    {track.artists?.map((artist) => artist.name).join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => toggleLike(track)}
                  className="text-sm text-green-400 hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
