import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../../../../core/database/playlist.db";
import { IptvCategory, IptvTvChannel } from "../../../../core/models/iptv-content.model";
import { PLAYLIST_DB } from "../../../../core/services/playlist.service";
import { ContentRepository } from "../../../../shared/data-access/content.repository";

export const LIVE_TV_DB = new InjectionToken<PlaylistDatabase>("LIVE_TV_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({ providedIn: "root" })
export class TvRepository {
  private readonly db = inject(LIVE_TV_DB);
  private readonly contentRepository = new ContentRepository<IptvTvChannel>(this.db, "tv", this.db.tv);

  getChannelCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.contentRepository.getCategories(playlistId, offset, limit);
  }

  getChannelCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.contentRepository.getCategory(playlistId, categoryId);
  }

  getChannelsByCategory(
    playlistId: number,
    categoryId: string,
    offset: number,
    limit: number,
  ): Promise<IptvTvChannel[]> {
    return this.contentRepository.getItemsByCategory(playlistId, categoryId, offset, limit);
  }

  getChannelByExternalId(playlistId: number, externalId: number): Promise<IptvTvChannel | undefined> {
    return this.db.tv.where("[playlistId+externalId]").equals([playlistId, externalId]).first();
  }
}
