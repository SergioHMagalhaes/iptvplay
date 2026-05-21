import { inject, Injectable } from "@angular/core";
import { IptvCategory, IptvTvChannel } from "../../../../core/models/iptv-content.model";
import { PlaylistEntry } from "../../../../core/models/playlist.model";
import { PlaylistService } from "../../../../core/services/playlist.service";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { TvRepository } from "../repositories/tv.repository";

@Injectable({ providedIn: "root" })
export class LiveTvService {
  private readonly repository = inject(TvRepository);
  private readonly playlistService = inject(PlaylistService);
  private readonly selectedPlaylistService = inject(SelectedPlaylistService);

  getChannelCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.repository.getChannelCategories(playlistId, offset, limit);
  }

  getChannelCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.repository.getChannelCategory(playlistId, categoryId);
  }

  getChannelsByCategory(
    playlistId: number,
    categoryId: string,
    offset: number,
    limit: number,
  ): Promise<IptvTvChannel[]> {
    return this.repository.getChannelsByCategory(playlistId, categoryId, offset, limit);
  }

  async getChannelPlaybackUrl(externalId: number): Promise<string> {
    const playlist = await this.requireSelectedPlaylist();
    if (!playlist.domain || !playlist.username || !playlist.password) {
      throw new Error("A playlist Xtream está incompleta.");
    }

    return new URL(
      `/live/${playlist.username}/${playlist.password}/${externalId}.m3u8`,
      normalizeDomain(playlist.domain),
    ).toString();
  }

  private async requireSelectedPlaylist(): Promise<PlaylistEntry> {
    const playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    if (playlistId === null) {
      throw new Error("Nenhuma playlist selecionada.");
    }

    const playlist = await this.playlistService.getPlaylistById(playlistId);
    if (!playlist) {
      throw new Error("Playlist selecionada não encontrada.");
    }

    return playlist;
  }
}

function normalizeDomain(domain: string): string {
  return /^https?:\/\//.test(domain) ? domain : `http://${domain}`;
}
