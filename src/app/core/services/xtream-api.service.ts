import { Injectable } from "@angular/core";
import { PlaylistEntry } from "../models/playlist.model";

export interface XtreamCategoryResponse {
  category_id: string;
  category_name: string;
}

export interface XtreamMovieResponse {
  stream_id: number;
  category_id: string;
  name: string;
  stream_icon?: string;
  added?: string;
}

export interface XtreamSeriesResponse {
  series_id: number;
  category_id: string;
  name: string;
  cover?: string;
  plot?: string;
}

export interface XtreamTvResponse {
  stream_id: number;
  category_id: string;
  name: string;
  stream_icon?: string;
  epg_channel_id?: string;
}

@Injectable({
  providedIn: "root",
})
export class XtreamApiService {
  fetchTvCategories(playlist: PlaylistEntry): Promise<XtreamCategoryResponse[]> {
    return this.fetch<XtreamCategoryResponse[]>(playlist, "get_live_categories");
  }

  fetchMovieCategories(playlist: PlaylistEntry): Promise<XtreamCategoryResponse[]> {
    return this.fetch<XtreamCategoryResponse[]>(playlist, "get_vod_categories");
  }

  fetchSeriesCategories(playlist: PlaylistEntry): Promise<XtreamCategoryResponse[]> {
    return this.fetch<XtreamCategoryResponse[]>(playlist, "get_series_categories");
  }

  fetchMovies(playlist: PlaylistEntry): Promise<XtreamMovieResponse[]> {
    return this.fetch<XtreamMovieResponse[]>(playlist, "get_vod_streams");
  }

  fetchSeries(playlist: PlaylistEntry): Promise<XtreamSeriesResponse[]> {
    return this.fetch<XtreamSeriesResponse[]>(playlist, "get_series");
  }

  fetchTv(playlist: PlaylistEntry): Promise<XtreamTvResponse[]> {
    return this.fetch<XtreamTvResponse[]>(playlist, "get_live_streams");
  }

  private async fetch<T>(playlist: PlaylistEntry, action: string): Promise<T> {
    if (!playlist.domain || !playlist.username || !playlist.password) {
      throw new Error("A playlist Xtream está incompleta.");
    }

    const url = new URL("/player_api.php", normalizeDomain(playlist.domain));
    url.searchParams.set("username", playlist.username);
    url.searchParams.set("password", playlist.password);
    url.searchParams.set("action", action);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha ao consultar o Xtream (${response.status}).`);
    }

    return (await response.json()) as T;
  }
}

function normalizeDomain(domain: string): string {
  return /^https?:\/\//.test(domain) ? domain : `http://${domain}`;
}
