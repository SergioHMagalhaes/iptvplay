import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../database/playlist.db";
import { IptvCategory, IptvMovie, IptvSeries, IptvTvChannel } from "../../models/iptv-content.model";
import { PLAYLIST_DB } from "../services/playlist.service";

export interface PlaylistContentSnapshot {
  categories: IptvCategory[];
  movies: IptvMovie[];
  series: IptvSeries[];
  tv: IptvTvChannel[];
}

export const PLAYLIST_CONTENT_DB = new InjectionToken<PlaylistDatabase>("PLAYLIST_CONTENT_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({
  providedIn: "root",
})
export class PlaylistContentRepository {
  private db = inject(PLAYLIST_CONTENT_DB);

  async replaceAllForPlaylist(playlistId: number, snapshot: PlaylistContentSnapshot): Promise<void> {
    await this.db.transaction("rw", this.db.categories, this.db.movies, this.db.series, this.db.tv, async () => {
      await Promise.all([
        this.db.categories.where("playlistId").equals(playlistId).delete(),
        this.db.movies.where("playlistId").equals(playlistId).delete(),
        this.db.series.where("playlistId").equals(playlistId).delete(),
        this.db.tv.where("playlistId").equals(playlistId).delete(),
      ]);

      await Promise.all([
        this.db.categories.bulkAdd(snapshot.categories),
        this.db.movies.bulkAdd(snapshot.movies),
        this.db.series.bulkAdd(snapshot.series),
        this.db.tv.bulkAdd(snapshot.tv),
      ]);
    });
  }
}
