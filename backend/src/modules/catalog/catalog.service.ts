import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Artist } from './entities/artist.entity.js';
import { Album } from './entities/album.entity.js';
import { Track } from './entities/track.entity.js';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Artist)
    private readonly artistsRepository: Repository<Artist>,

    @InjectRepository(Album)
    private readonly albumsRepository: Repository<Album>,

    @InjectRepository(Track)
    private readonly tracksRepository: Repository<Track>,
  ) {}

  async searchCatalog(query: string, limit = 20) {
    const term = `%${query.trim()}%`;

    const [tracks, artists, albums] = await Promise.all([
      this.tracksRepository
        .createQueryBuilder('track')
        .leftJoinAndSelect('track.artists', 'artist')
        .leftJoinAndSelect('track.album', 'album')
        .leftJoinAndSelect('track.genres', 'genre')
        .leftJoinAndSelect('track.moods', 'mood')
        .where('track.title ILIKE :term', { term })
        .orWhere('artist.name ILIKE :term', { term })
        .distinct(true)
        .take(limit)
        .getMany(),

      this.artistsRepository
        .createQueryBuilder('artist')
        .where('artist.name ILIKE :term', { term })
        .take(limit)
        .getMany(),

      this.albumsRepository
        .createQueryBuilder('album')
        .where('album.title ILIKE :term', { term })
        .take(limit)
        .getMany(),
    ]);

    return { query: query.trim(), tracks, artists, albums };
  }

  async findArtists(limit = 20) {
    return this.artistsRepository.find({
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findArtist(id: string) {
    const artist = await this.artistsRepository.findOne({
      where: { id },
      relations: { tracks: { album: true } },
    });

    if (!artist) {
      throw new NotFoundException('Artist not found');
    }

    return artist;
  }

  async findAlbums(limit = 20) {
    return this.albumsRepository.find({
      take: limit,
      order: { releaseDate: 'DESC' },
    });
  }

  async findAlbum(id: string) {
    const album = await this.albumsRepository.findOne({
      where: { id },
      relations: { tracks: { artists: true } },
    });

    if (!album) {
      throw new NotFoundException('Album not found');
    }

    return album;
  }

  async findTracks(limit = 20) {
    return this.tracksRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        artists: true,
        album: true,
        genres: true,
        moods: true,
      },
    });
  }

  async findTrack(id: string) {
    const track = await this.tracksRepository.findOne({
      where: { id },
      relations: {
        artists: true,
        album: true,
        genres: true,
        moods: true,
        audioFiles: true,
      },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    return track;
  }
}
