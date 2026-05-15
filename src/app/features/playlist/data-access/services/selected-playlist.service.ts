import { inject, Injectable } from "@angular/core";
import { SelectedPlaylistRepository } from "../repositories/selected-playlist.repository";

@Injectable({
  providedIn: "root",
})
export class SelectedPlaylistService {
  private repository = inject(SelectedPlaylistRepository);

  getSelectedPlaylistId(): Promise<number | null> {
    return this.repository.getSelectedPlaylistId();
  }

  selectPlaylist(playlistId: number): Promise<void> {
    return this.repository.setSelectedPlaylistId(playlistId);
  }
}
