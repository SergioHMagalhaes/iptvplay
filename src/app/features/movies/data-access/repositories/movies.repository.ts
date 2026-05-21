import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../../../../core/database/playlist.db";
import { IptvCategory, IptvMovie } from "../../../../core/models/iptv-content.model";
import { PLAYLIST_DB } from "../../../../core/services/playlist.service";
import { ContentRepository } from "../../../../shared/data-access/content.repository";

export const MOVIES_DB = new InjectionToken<PlaylistDatabase>("MOVIES_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({ providedIn: "root" })
export class MoviesRepository {
  private db = inject(MOVIES_DB);
  private contentRepository = new ContentRepository<IptvMovie>(this.db, "movie", this.db.movies);

  async getMovieCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.contentRepository.getCategories(playlistId, offset, limit);
  }

  async getMovieCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.contentRepository.getCategory(playlistId, categoryId);
  }

  async getMoviesByCategory(
    playlistId: number,
    categoryId: string,
    offset: number,
    limit: number,
  ): Promise<IptvMovie[]> {
    return this.contentRepository.getItemsByCategory(playlistId, categoryId, offset, limit);
  }

  async getMovieByExternalId(playlistId: number, externalId: number): Promise<IptvMovie | undefined> {
    return this.db.movies.where("[playlistId+externalId]").equals([playlistId, externalId]).first();
  }
}
