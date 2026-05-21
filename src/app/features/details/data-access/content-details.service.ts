import { inject, Injectable } from "@angular/core";
import { IptvMovie, IptvSeries } from "../../../core/models/iptv-content.model";
import { PlaylistEntry } from "../../../core/models/playlist.model";
import { PlaylistService } from "../../../core/services/playlist.service";
import { SelectedPlaylistService } from "../../../core/services/selected-playlist.service";
import { MoviesService } from "../../movies/data-access/services/movies.service";
import { SeriesService } from "../../series/data-access/services/series.service";

export type DetailKind = "movie" | "series";

export interface ContentDetails {
  kind: DetailKind;
  externalId: number;
  name: string;
  fallbackImage?: string;
  synopsis?: string;
}

export interface SeriesEpisode {
  id: number;
  season: number;
  episodeNumber: number;
  title: string;
  image?: string;
  duration?: string;
  extension?: string;
}

interface XtreamSeriesInfoResponse {
  episodes?: Record<string, XtreamEpisodeResponse[]>;
}

interface XtreamEpisodeResponse {
  id: string | number;
  episode_num?: number;
  title?: string;
  container_extension?: string;
  info?: {
    movie_image?: string;
    duration?: string;
  };
}

@Injectable({ providedIn: "root" })
export class ContentDetailsService {
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private playlistService = inject(PlaylistService);
  private moviesService = inject(MoviesService);
  private seriesService = inject(SeriesService);

  async getDetails(kind: DetailKind, externalId: number): Promise<ContentDetails | null> {
    const playlistId = await this.requireSelectedPlaylistId();
    const item =
      kind === "movie"
        ? await this.moviesService.getMovieByExternalId(playlistId, externalId)
        : await this.seriesService.getSeriesByExternalId(playlistId, externalId);

    if (!item) return null;

    return kind === "movie" ? this.mapMovie(item) : this.mapSeries(item);
  }

  async getSeriesEpisodes(seriesId: number): Promise<SeriesEpisode[]> {
    const playlist = await this.requireSelectedPlaylist();
    const url = this.createXtreamUrl(playlist, "get_series_info");
    url.searchParams.set("series_id", String(seriesId));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao carregar episódios (${response.status}).`);
    }

    const data = (await response.json()) as XtreamSeriesInfoResponse;
    return Object.entries(data.episodes ?? {}).flatMap(([season, episodes]) =>
      episodes.map((episode, index) => ({
        id: Number(episode.id),
        season: Number(season),
        episodeNumber: episode.episode_num ?? index + 1,
        title: episode.title || `Episódio ${episode.episode_num ?? index + 1}`,
        image: episode.info?.movie_image,
        duration: episode.info?.duration,
        extension: episode.container_extension,
      })),
    );
  }

  async getPlaybackUrl(kind: DetailKind, externalId: number, extension = "mp4"): Promise<string> {
    const playlist = await this.requireSelectedPlaylist();
    if (!playlist.domain || !playlist.username || !playlist.password) {
      throw new Error("A playlist Xtream está incompleta.");
    }

    const baseUrl = normalizeDomain(playlist.domain);
    const folder = kind === "movie" ? "movie" : "series";
    return new URL(
      `/${folder}/${playlist.username}/${playlist.password}/${externalId}.${extension}`,
      baseUrl,
    ).toString();
  }

  private async requireSelectedPlaylistId(): Promise<number> {
    const playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    if (playlistId === null) {
      throw new Error("Nenhuma playlist selecionada.");
    }
    return playlistId;
  }

  private async requireSelectedPlaylist(): Promise<PlaylistEntry> {
    const playlistId = await this.requireSelectedPlaylistId();
    const playlist = await this.playlistService.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error("Playlist selecionada não encontrada.");
    }
    return playlist;
  }

  private createXtreamUrl(playlist: PlaylistEntry, action: string): URL {
    if (!playlist.domain || !playlist.username || !playlist.password) {
      throw new Error("A playlist Xtream está incompleta.");
    }

    const url = new URL("/player_api.php", normalizeDomain(playlist.domain));
    url.searchParams.set("username", playlist.username);
    url.searchParams.set("password", playlist.password);
    url.searchParams.set("action", action);
    return url;
  }

  private mapMovie(movie: IptvMovie): ContentDetails {
    return {
      kind: "movie",
      externalId: movie.externalId,
      name: movie.name,
      fallbackImage: movie.streamIcon,
    };
  }

  private mapSeries(series: IptvSeries): ContentDetails {
    return {
      kind: "series",
      externalId: series.externalId,
      name: series.name,
      fallbackImage: series.cover,
      synopsis: series.plot,
    };
  }
}

function normalizeDomain(domain: string): string {
  return /^https?:\/\//.test(domain) ? domain : `http://${domain}`;
}
