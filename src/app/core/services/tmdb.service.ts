import { Injectable } from "@angular/core";
import { sanitizeTitle } from "../../shared/utils/title-sanitizer";

export type TmdbContentType = "movie" | "series";

export interface TmdbContentDetails {
  id: number;
  title: string;
  overview?: string;
  backdropPath?: string;
  logoPath?: string;
  year?: string;
  runtime?: number;
  voteAverage?: number;
  genres?: string[];
  numberOfSeasons?: number;
}

export interface TmdbSeasonDetails {
  seasonNumber: number;
  episodes: TmdbEpisodeDetails[];
}

export interface TmdbEpisodeDetails {
  episodeNumber: number;
  title: string;
  stillPath?: string;
  duration?: number;
}

@Injectable({ providedIn: "root" })
export class TmdbService {
  async search(type: TmdbContentType, title: string): Promise<TmdbContentDetails | null> {
    const titlesanitize = sanitizeTitle(title);
    const params = new URLSearchParams({
      type,
      query: titlesanitize,
    });

    return this.fetchProxy<TmdbContentDetails | null>(`/api/tmdb/search?${params.toString()}`);
  }

  async getSeason(seriesId: number, season: number): Promise<TmdbSeasonDetails> {
    const params = new URLSearchParams({
      seriesId: String(seriesId),
      season: String(season),
    });

    return this.fetchProxy<TmdbSeasonDetails>(`/api/tmdb/season?${params.toString()}`);
  }

  imageUrl(path?: string, size = "original"): string | undefined {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : undefined;
  }

  private async fetchProxy<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao consultar o TMDB (${response.status}).`);
    }

    return (await response.json()) as T;
  }
}
