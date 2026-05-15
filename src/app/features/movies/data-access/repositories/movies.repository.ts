import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../../../../core/database/playlist.db";
import { IptvCategory, IptvMovie } from "../../../../core/models/iptv-content.model";
import { PLAYLIST_DB } from "../../../../core/services/playlist.service";

export const MOVIES_DB = new InjectionToken<PlaylistDatabase>("MOVIES_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({ providedIn: "root" })
export class MoviesRepository {
  private db = inject(MOVIES_DB);

  async getMovieCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.db.categories
      .where("[playlistId+type]")
      .equals([playlistId, "movie"])
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async getMovieCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.db.categories
      .where("[playlistId+externalId]")
      .equals([playlistId, categoryId])
      .and((category) => category.type === "movie")
      .first();
  }

  async getMoviesByCategory(
    playlistId: number,
    categoryId: string,
    offset: number,
    limit: number,
  ): Promise<IptvMovie[]> {
    return this.db.movies
      .where("categoryId")
      .equals(categoryId)
      .and((movie) => movie.playlistId === playlistId)
      .offset(offset)
      .limit(limit)
      .toArray();
  }
}
