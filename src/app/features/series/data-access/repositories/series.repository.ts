import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../../../../core/database/playlist.db";
import { IptvCategory, IptvSeries } from "../../../../core/models/iptv-content.model";
import { PLAYLIST_DB } from "../../../../core/services/playlist.service";
import { ContentRepository } from "../../../../shared/data-access/content.repository";

export const SERIES_DB = new InjectionToken<PlaylistDatabase>("SERIES_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({ providedIn: "root" })
export class SeriesRepository {
  private db = inject(SERIES_DB);
  private contentRepository = new ContentRepository<IptvSeries>(this.db, "series", this.db.series);

  async getSeriesCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.contentRepository.getCategories(playlistId, offset, limit);
  }

  async getSeriesCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.contentRepository.getCategory(playlistId, categoryId);
  }

  async getSeriesByCategory(
    playlistId: number,
    categoryId: string,
    offset: number,
    limit: number,
  ): Promise<IptvSeries[]> {
    return this.contentRepository.getItemsByCategory(playlistId, categoryId, offset, limit);
  }

  async getSeriesByExternalId(playlistId: number, externalId: number): Promise<IptvSeries | undefined> {
    return this.db.series.where("[playlistId+externalId]").equals([playlistId, externalId]).first();
  }
}
