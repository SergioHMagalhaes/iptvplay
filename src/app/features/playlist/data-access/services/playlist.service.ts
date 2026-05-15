import { inject, Injectable, InjectionToken } from "@angular/core";
import { PlaylistEntry } from "../../models/playlist.model";
import { PlaylistDatabase, getDb } from "../database/playlist.db";

/** Token de injeção para o banco de dados (testes podem sobrescrever) */
export const PLAYLIST_DB = new InjectionToken<PlaylistDatabase>("PLAYLIST_DB", {
  providedIn: "root",
  factory: () => getDb(),
});

@Injectable({
  providedIn: "root",
})
export class PlaylistService {
  private db = inject(PLAYLIST_DB);

  async getAllPlaylists(): Promise<PlaylistEntry[]> {
    return await this.db.playlists.toArray();
  }

  async getPlaylistById(id: number): Promise<PlaylistEntry | undefined> {
    return await this.db.playlists.get(id);
  }

  async addPlaylist(playlist: PlaylistEntry): Promise<number> {
    // Verificar nome duplicado
    const existing = await this.db.playlists.where("name").equalsIgnoreCase(playlist.name).first();
    if (existing) {
      throw new Error(`Já existe uma lista com o nome "${playlist.name}".`);
    }
    return await this.db.playlists.add(playlist);
  }

  async updatePlaylist(id: number, playlist: Partial<PlaylistEntry>): Promise<void> {
    await this.db.playlists.update(id, playlist);
  }

  async deletePlaylist(id: number): Promise<void> {
    await this.db.playlists.delete(id);
  }
}
