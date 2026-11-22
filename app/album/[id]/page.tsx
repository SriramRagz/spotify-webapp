'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type AlbumData = {
  id: string;
  title: string;
  description: string | null;
  releaseDate: string | null;
  albumType: string;
  tracks?: {
    id: string;
    title: string;
    durationMs: number;
    trackNumber: number | null;
    artists?: { id: string; name: string }[];
  }[];
};

function AlbumPageContent() {
  const params = useParams();
  const id = params.id as string;
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    fetch(`/api/catalog/albums/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error('Album could not be found.');
        return response.json();
      })
      .then(setAlbum)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDuration = (ms: number) =>
    `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  if (loading) return <main className="min-h-screen bg-[#121212] p-10 text-white">Loading album...</main>;
  if (error || !album) return <main className="min-h-screen bg-[#121212] p-10 text-white">{error || 'Album not found.'}</main>;

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="bg-gradient-to-b from-[#604b72] to-[#121212] px-8 py-16">
        <Link href="/" className="text-sm text-white/70 hover:text-white">← Back to Home</Link>
        <p className="mt-12 text-sm font-semibold uppercase tracking-widest">{album.albumType}</p>
        <h1 className="mt-3 text-5xl font-bold md:text-7xl">{album.title}</h1>
        {album.releaseDate && (
          <p className="mt-4 text-white/70">{new Date(album.releaseDate).getFullYear()}</p>
        )}
        {album.description && <p className="mt-3 text-white/70">{album.description}</p>}
        <p className="mt-2 text-sm text-white/50">{album.tracks?.length ?? 0} tracks</p>
      </div>

      <section className="px-8 py-8">
        <h2 className="mb-6 text-2xl font-bold">Track list</h2>
        {album.tracks?.length ? (
          <div className="space-y-2">
            {album.tracks.map((track, index) => (
              <div key={track.id} className="flex items-center gap-4 rounded-md p-3 hover:bg-white/10">
                <span className="w-5 text-white/50">{track.trackNumber ?? index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{track.title}</p>
                  <div className="flex flex-wrap gap-1 text-sm text-white/50">
                    {track.artists?.map((artist, artistIndex) => (
                      <span key={artist.id}>
                        {artistIndex > 0 ? ', ' : ''}
                        <Link href={`/artist/${artist.id}`} className="hover:text-white hover:underline">
                          {artist.name}
                        </Link>
                      </span>
                    ))}
                  </div>
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
    <Suspense fallback={<main className="min-h-screen bg-[#121212] p-10 text-white">Loading album page...</main>}>
      <AlbumPageContent />
    </Suspense>
  );
}
