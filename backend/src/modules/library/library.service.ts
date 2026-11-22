import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LibraryService {
  constructor(private readonly dataSource: DataSource) {}

  async createPlaylist(userId: string, data: any) {
    const result = await this.dataSource.query(
      `INSERT INTO playlists (owner_id, name, description, is_public)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, data.name, data.description ?? null, data.isPublic ?? true],
    );

    return result[0];
  }

  async getPlaylists(userId: string) {
    return this.dataSource.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM playlist_tracks pt
         WHERE pt.playlist_id = p.id)::int AS track_count
       FROM playlists p
       WHERE p.owner_id = $1
       ORDER BY p.created_at DESC`,
      [userId],
    );
  }

  async getPlaylist(userId: string, playlistId: string) {
    const playlists = await this.dataSource.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM playlist_tracks pt
         WHERE pt.playlist_id = p.id)::int AS track_count
       FROM playlists p
       WHERE p.id = $1
       AND (p.owner_id = $2 OR p.is_public = TRUE)`,
      [playlistId, userId],
    );

    if (!playlists.length) {
      throw new NotFoundException('Playlist not found');
    }

    const tracks = await this.dataSource.query(
      `SELECT t.*, pt.position, pt.added_at,
        COALESCE(
          (SELECT json_agg(json_build_object('id', a.id, 'name', a.name))
           FROM artist_tracks at
           JOIN artists a ON a.id = at.artist_id
           WHERE at.track_id = t.id),
          '[]'::json
        ) AS artists
       FROM playlist_tracks pt
       JOIN tracks t ON t.id = pt.track_id
       WHERE pt.playlist_id = $1
       ORDER BY pt.position`,
      [playlistId],
    );

    return { ...playlists[0], tracks };
  }

  async updatePlaylist(userId: string, playlistId: string, data: any) {
    await this.ensureOwner(userId, playlistId);

    const result = await this.dataSource.query(
      `UPDATE playlists
       SET name = COALESCE($3, name),
           description = COALESCE($4, description),
           is_public = COALESCE($5, is_public),
           updated_at = NOW()
       WHERE id = $1 AND owner_id = $2
       RETURNING *`,
      [
        playlistId,
        userId,
        data.name ?? null,
        data.description ?? null,
        data.isPublic ?? null,
      ],
    );

    return result[0];
  }

  async deletePlaylist(userId: string, playlistId: string) {
    await this.ensureOwner(userId, playlistId);

    await this.dataSource.query(
      'DELETE FROM playlists WHERE id = $1 AND owner_id = $2',
      [playlistId, userId],
    );

    return { message: 'Playlist deleted successfully' };
  }

  async addTrack(userId: string, playlistId: string, trackId: string) {
    await this.ensureOwner(userId, playlistId);

    const result = await this.dataSource.query(
      `INSERT INTO playlist_tracks (playlist_id, track_id, position, added_by)
       SELECT $1, $2, COALESCE(MAX(position) + 1, 0), $3
       FROM playlist_tracks
       WHERE playlist_id = $1
       RETURNING *`,
      [playlistId, trackId, userId],
    );

    return result[0];
  }

  async removeTrack(userId: string, playlistId: string, trackId: string) {
    await this.ensureOwner(userId, playlistId);

    const result = await this.dataSource.query(
      `DELETE FROM playlist_tracks
       WHERE playlist_id = $1 AND track_id = $2
       RETURNING *`,
      [playlistId, trackId],
    );

    if (!result.length) {
      throw new NotFoundException('Track not found in playlist');
    }

    return { message: 'Track removed from playlist' };
  }

  async getLikedTracks(userId: string) {
    return this.dataSource.query(
      `SELECT t.*, lt.created_at AS liked_at
       FROM liked_tracks lt
       JOIN tracks t ON t.id = lt.track_id
       WHERE lt.user_id = $1
       ORDER BY lt.created_at DESC`,
      [userId],
    );
  }

  async likeTrack(userId: string, trackId: string) {
    await this.dataSource.query(
      `INSERT INTO liked_tracks (user_id, track_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, trackId],
    );

    return { message: 'Track added to liked songs' };
  }

  async unlikeTrack(userId: string, trackId: string) {
    await this.dataSource.query(
      'DELETE FROM liked_tracks WHERE user_id = $1 AND track_id = $2',
      [userId, trackId],
    );

    return { message: 'Track removed from liked songs' };
  }

  async saveAlbum(userId: string, albumId: string) {
    await this.dataSource.query(
      `INSERT INTO saved_albums (user_id, album_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, albumId],
    );

    return { message: 'Album saved to your library' };
  }

  async unsaveAlbum(userId: string, albumId: string) {
    await this.dataSource.query(
      'DELETE FROM saved_albums WHERE user_id = $1 AND album_id = $2',
      [userId, albumId],
    );

    return { message: 'Album removed from your library' };
  }

  async followArtist(userId: string, artistId: string) {
    await this.dataSource.query(
      `INSERT INTO followed_artists (user_id, artist_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, artistId],
    );

    return { message: 'Artist followed successfully' };
  }

  async unfollowArtist(userId: string, artistId: string) {
    await this.dataSource.query(
      'DELETE FROM followed_artists WHERE user_id = $1 AND artist_id = $2',
      [userId, artistId],
    );

    return { message: 'Artist unfollowed successfully' };
  }

  private async ensureOwner(userId: string, playlistId: string) {
    const result = await this.dataSource.query(
      'SELECT owner_id FROM playlists WHERE id = $1',
      [playlistId],
    );

    if (!result.length) {
      throw new NotFoundException('Playlist not found');
    }

    if (result[0].owner_id !== userId) {
      throw new ForbiddenException('You do not own this playlist');
    }
  }
}
