import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Artist } from './entities/artist.entity.js';
import { Album } from './entities/album.entity.js';
import { Track } from './entities/track.entity.js';
import { Genre } from './entities/genre.entity.js';
import { Mood } from './entities/mood.entity.js';
import { TrackAudioFile } from './entities/track-audio-file.entity.js';

import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Artist,
      Album,
      Track,
      Genre,
      Mood,
      TrackAudioFile,
    ]),
  ],
  controllers: [CatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
