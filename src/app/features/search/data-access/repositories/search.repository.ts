import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../../../../core/database/playlist.db";
import { IptvMovie, IptvSeries, IptvTvChannel } from "../../../../core/models/iptv-content.model";
import { PLAYLIST_DB } from "../../../../core/services/playlist.service";

export interface SearchableContent {
  movies: IptvMovie[];
  series: IptvSeries[];
  tv: IptvTvChannel[];
}

export const SEARCH_DB = new InjectionToken<PlaylistDatabase>("SEARCH_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({ providedIn: "root" })
export class SearchRepository {
  private readonly db = inject(SEARCH_DB);

  async getSearchableContent(playlistId: number): Promise<SearchableContent> {
    const [movies, series, tv] = await Promise.all([
      this.db.movies.where("playlistId").equals(playlistId).toArray(),
      this.db.series.where("playlistId").equals(playlistId).toArray(),
      this.db.tv.where("playlistId").equals(playlistId).toArray(),
    ]);

    return { movies, series, tv };
  }
}
