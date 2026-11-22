'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type ArtistData = {
  id: string;
  name: string;
  bio: string | null;
  country: string | null;
  isVerified: boolean;
  tracks?: {
    id: string;
    title: string;
    durationMs: number;
    album?: { id: string; title: string } | null;
  }[];
};

function ArtistPageContent() {
  const params = useParams();
  const id = params.id as string;
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/catalog/artists/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error('Artist could not be found.');
        return response.json();
      })
      .then(setArtist)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDuration = (ms: number) =>
    `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  if (loading) return <main className="min-h-screen bg-[#121212] p-10 text-white">Loading artist...</main>;
  if (error || !artist) return <main className="min-h-screen bg-[#121212] p-10 text-white">{error || 'Artist not found.'}</main>;

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="bg-gradient-to-b from-[#3b5268] to-[#121212] px-8 py-16">
        <Link href="/" className="text-sm text-white/70 hover:text-white">← Back to Home</Link>
        <p className="mt-12 text-sm font-semibold uppercase tracking-widest">Artist</p>
        <h1 className="mt-3 text-5xl font-bold md:text-7xl">{artist.name}</h1>
        {artist.isVerified && <p className="mt-4 text-sm text-green-400">✓ Verified Artist</p>}
        <p className="mt-3 text-white/70">{artist.country || 'Artist'} {artist.bio ? `· ${artist.bio}` : ''}</p>
      </div>

      <section className="px-8 py-8">
        <h2 className="mb-6 text-2xl font-bold">Popular tracks</h2>
        {artist.tracks?.length ? (
          <div className="space-y-2">
            {artist.tracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4 rounded-md p-3 hover:bg-white/10">
                <span className="w-5 text-white/50">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{track.title}</p>
                  {track.album && (
                    <Link href={`/album/${track.album.id}`} className="text-sm text-white/50 hover:underline">
                      {track.album.title}
                    </Link>
                  )}
                </div>
                <span className="text-sm text-white/50">{formatDuration(track.durationMs)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/50">No tracks available yet.</p>
        )}
      </section>
    </main>
  );
}


export default function Page() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#121212] p-10 text-white">Loading artist page...</main>}>
      <ArtistPageContent />
    </Suspense>
  );
}
