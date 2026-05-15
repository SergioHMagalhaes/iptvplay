import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistDatabase } from "../database/playlist.db";
import { PLAYLIST_DB } from "../services/playlist.service";

export const SELECTED_PLAYLIST_DB = new InjectionToken<PlaylistDatabase>("SELECTED_PLAYLIST_DB", {
  providedIn: "root",
  factory: () => inject(PLAYLIST_DB),
});

@Injectable({
  providedIn: "root",
})
export class SelectedPlaylistRepository {
  private db = inject(SELECTED_PLAYLIST_DB);

  async getSelectedPlaylistId(): Promise<number | null> {
    return (await this.db.settings.get("selectedPlaylistId"))?.value ?? null;
  }

  async setSelectedPlaylistId(playlistId: number | null): Promise<void> {
    await this.db.settings.put({ key: "selectedPlaylistId", value: playlistId });
  }
}
