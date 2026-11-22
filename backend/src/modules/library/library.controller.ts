import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { LibraryService } from './library.service.js';
import {
  CreatePlaylistDto,
  UpdatePlaylistDto,
  AddTrackDto,
} from './dto/library.dto.js';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('library')
@UseGuards(AuthGuard('jwt'))
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('playlists')
  createPlaylist(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreatePlaylistDto,
  ) {
    return this.libraryService.createPlaylist(req.user.userId, body);
  }

  @Get('playlists')
  getPlaylists(@Req() req: AuthenticatedRequest) {
    return this.libraryService.getPlaylists(req.user.userId);
  }

  @Get('playlists/:id')
  getPlaylist(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.libraryService.getPlaylist(req.user.userId, id);
  }

  @Patch('playlists/:id')
  updatePlaylist(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePlaylistDto,
  ) {
    return this.libraryService.updatePlaylist(req.user.userId, id, body);
  }

  @Delete('playlists/:id')
  deletePlaylist(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.libraryService.deletePlaylist(req.user.userId, id);
  }

  @Post('playlists/:id/tracks')
  addTrack(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AddTrackDto,
  ) {
    return this.libraryService.addTrack(req.user.userId, id, body.trackId);
  }

  @Delete('playlists/:id/tracks/:trackId')
  removeTrack(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return this.libraryService.removeTrack(req.user.userId, id, trackId);
  }

  @Get('liked-tracks')
  getLikedTracks(@Req() req: AuthenticatedRequest) {
    return this.libraryService.getLikedTracks(req.user.userId);
  }

  @Post('liked-tracks/:trackId')
  likeTrack(
    @Req() req: AuthenticatedRequest,
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return this.libraryService.likeTrack(req.user.userId, trackId);
  }

  @Delete('liked-tracks/:trackId')
  unlikeTrack(
    @Req() req: AuthenticatedRequest,
    @Param('trackId', ParseUUIDPipe) trackId: string,
  ) {
    return this.libraryService.unlikeTrack(req.user.userId, trackId);
  }

  @Post('saved-albums/:albumId')
  saveAlbum(
    @Req() req: AuthenticatedRequest,
    @Param('albumId', ParseUUIDPipe) albumId: string,
  ) {
    return this.libraryService.saveAlbum(req.user.userId, albumId);
  }

  @Delete('saved-albums/:albumId')
  unsaveAlbum(
    @Req() req: AuthenticatedRequest,
    @Param('albumId', ParseUUIDPipe) albumId: string,
  ) {
    return this.libraryService.unsaveAlbum(req.user.userId, albumId);
  }

  @Post('followed-artists/:artistId')
  followArtist(
    @Req() req: AuthenticatedRequest,
    @Param('artistId', ParseUUIDPipe) artistId: string,
  ) {
    return this.libraryService.followArtist(req.user.userId, artistId);
  }

  @Delete('followed-artists/:artistId')
  unfollowArtist(
    @Req() req: AuthenticatedRequest,
    @Param('artistId', ParseUUIDPipe) artistId: string,
  ) {
    return this.libraryService.unfollowArtist(req.user.userId, artistId);
  }
}
