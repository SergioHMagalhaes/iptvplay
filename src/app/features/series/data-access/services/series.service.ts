import { inject, Injectable } from "@angular/core";
import { IptvCategory, IptvSeries } from "../../../../core/models/iptv-content.model";
import { SeriesRepository } from "../repositories/series.repository";

@Injectable({ providedIn: "root" })
export class SeriesService {
  private repository = inject(SeriesRepository);

  getSeriesCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.repository.getSeriesCategories(playlistId, offset, limit);
  }

  getSeriesCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.repository.getSeriesCategory(playlistId, categoryId);
  }

  getSeriesByCategory(playlistId: number, categoryId: string, offset: number, limit: number): Promise<IptvSeries[]> {
    return this.repository.getSeriesByCategory(playlistId, categoryId, offset, limit);
  }

  getSeriesByExternalId(playlistId: number, externalId: number): Promise<IptvSeries | undefined> {
    return this.repository.getSeriesByExternalId(playlistId, externalId);
  }
}
