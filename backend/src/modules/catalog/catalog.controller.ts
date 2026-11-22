import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';

import { CatalogService } from './catalog.service.js';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  private getLimit(value?: string): number {
    const parsed = Number(value ?? 20);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return 20;
    }

    return Math.min(parsed, 100);
  }

  @Get('search')
  searchCatalog(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query?.trim()) {
      throw new BadRequestException('Please provide a search term using q.');
    }

    return this.catalogService.searchCatalog(
      query.trim(),
      this.getLimit(limit),
    );
  }

  @Get('artists')
  findArtists(@Query('limit') limit?: string) {
    return this.catalogService.findArtists(this.getLimit(limit));
  }

  @Get('artists/:id')
  findArtist(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.findArtist(id);
  }

  @Get('albums')
  findAlbums(@Query('limit') limit?: string) {
    return this.catalogService.findAlbums(this.getLimit(limit));
  }

  @Get('albums/:id')
  findAlbum(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.findAlbum(id);
  }

  @Get('tracks')
  findTracks(@Query('limit') limit?: string) {
    return this.catalogService.findTracks(this.getLimit(limit));
  }

  @Get('tracks/:id')
  findTrack(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.catalogService.findTrack(id);
  }
}
