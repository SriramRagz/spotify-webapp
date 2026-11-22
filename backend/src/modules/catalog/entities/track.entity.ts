import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, ManyToOne,
  ManyToMany, OneToMany, JoinColumn, JoinTable,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Album } from './album.entity.js';
import { Artist } from './artist.entity.js';
import { Genre } from './genre.entity.js';
import { Mood } from './mood.entity.js';
import { TrackAudioFile } from './track-audio-file.entity.js';

@Entity('tracks')
export class Track {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 200 })
  title!: string;

  @ManyToOne(() => Album, (album) => album.tracks, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'album_id' })
  album!: Relation<Album> | null;

  @Column({ name: 'duration_ms', type: 'integer', default: 0 })
  durationMs!: number;

  @Column({ name: 'track_number', type: 'integer', nullable: true })
  trackNumber!: number | null;

  @Column({ name: 'disc_number', type: 'integer', default: 1 })
  discNumber!: number;

  @Column({ default: false })
  explicit!: boolean;

  @Column({ type: 'text', nullable: true })
  lyrics!: string | null;

  @ManyToMany(() => Artist, (artist) => artist.tracks)
  @JoinTable({
    name: 'artist_tracks',
    joinColumn: { name: 'track_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'artist_id', referencedColumnName: 'id' },
  })
  artists!: Relation<Artist[]>;

  @ManyToMany(() => Genre, (genre) => genre.tracks)
  @JoinTable({
    name: 'track_genres',
    joinColumn: { name: 'track_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'genre_id', referencedColumnName: 'id' },
  })
  genres!: Relation<Genre[]>;

  @ManyToMany(() => Mood, (mood) => mood.tracks)
  @JoinTable({
    name: 'track_moods',
    joinColumn: { name: 'track_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'mood_id', referencedColumnName: 'id' },
  })
  moods!: Relation<Mood[]>;

  @OneToMany(() => TrackAudioFile, (audioFile) => audioFile.track)
  audioFiles!: Relation<TrackAudioFile[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
