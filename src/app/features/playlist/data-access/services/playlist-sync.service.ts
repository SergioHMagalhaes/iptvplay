import { inject, Injectable } from "@angular/core";
import { IptvCategory } from "../../models/iptv-content.model";
import { PlaylistEntry } from "../../models/playlist.model";
import { PlaylistContentRepository } from "../repositories/playlist-content.repository";
import { XtreamApiService } from "./xtream-api.service";

@Injectable({
  providedIn: "root",
})
export class PlaylistSyncService {
  private xtreamApi = inject(XtreamApiService);
  private repository = inject(PlaylistContentRepository);

  async syncPlaylist(playlist: PlaylistEntry): Promise<void> {
    if (playlist.id === undefined) {
      throw new Error("A playlist precisa estar salva antes da sincronização.");
    }
    if (playlist.sourceType !== "xtream") {
      throw new Error("A sincronização automática exige uma playlist Xtream.");
    }

    const now = new Date().toISOString();
    const [tvCategories, movieCategories, seriesCategories, movies, series, tv] = await Promise.all([
      this.xtreamApi.fetchTvCategories(playlist),
      this.xtreamApi.fetchMovieCategories(playlist),
      this.xtreamApi.fetchSeriesCategories(playlist),
      this.xtreamApi.fetchMovies(playlist),
      this.xtreamApi.fetchSeries(playlist),
      this.xtreamApi.fetchTv(playlist),
    ]);

    const normalizedCategories = [
      ...normalizeCategories(playlist.id, tvCategories, "tv", now),
      ...normalizeCategories(playlist.id, movieCategories, "movie", now),
      ...normalizeCategories(playlist.id, seriesCategories, "series", now),
    ];

    await this.repository.replaceAllForPlaylist(playlist.id, {
      categories: normalizedCategories,
      movies: movies.map((movie) => ({
        playlistId: playlist.id!,
        externalId: movie.stream_id,
        categoryId: movie.category_id,
        name: movie.name,
        streamIcon: movie.stream_icon,
        added: movie.added,
        createdAt: now,
        updatedAt: now,
      })),
      series: series.map((entry) => ({
        playlistId: playlist.id!,
        externalId: entry.series_id,
        categoryId: entry.category_id,
        name: entry.name,
        cover: entry.cover,
        plot: entry.plot,
        createdAt: now,
        updatedAt: now,
      })),
      tv: tv.map((channel) => ({
        playlistId: playlist.id!,
        externalId: channel.stream_id,
        categoryId: channel.category_id,
        name: channel.name,
        streamIcon: channel.stream_icon,
        epgChannelId: channel.epg_channel_id,
        createdAt: now,
        updatedAt: now,
      })),
    });
  }
}

function normalizeCategories(
  playlistId: number,
  categories: { category_id: string; category_name: string }[],
  type: IptvCategory["type"],
  now: string,
): IptvCategory[] {
  return categories.map((category) => ({
    playlistId,
    externalId: category.category_id,
    name: category.category_name,
    type,
    createdAt: now,
    updatedAt: now,
  }));
}
