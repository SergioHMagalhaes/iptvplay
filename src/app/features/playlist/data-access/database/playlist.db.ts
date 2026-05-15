import Dexie, { Table } from "dexie";
import { PlaylistEntry } from "../../models/playlist.model";
import { IptvCategory, IptvMovie, IptvSeries, IptvTvChannel } from "../../models/iptv-content.model";

export interface AppSetting {
  key: "selectedPlaylistId";
  value: number | null;
}

export class PlaylistDatabase extends Dexie {
  playlists!: Table<PlaylistEntry, number>;
  categories!: Table<IptvCategory, number>;
  movies!: Table<IptvMovie, number>;
  series!: Table<IptvSeries, number>;
  tv!: Table<IptvTvChannel, number>;
  settings!: Table<AppSetting, string>;

  constructor(dbName = "iptvplay-db") {
    super(dbName);
    this.version(1).stores({
      playlists: "++id, &name, sourceType",
    });
    this.version(2).stores({
      playlists: "++id, &name, sourceType",
      categories: "++id, playlistId, [playlistId+type], [playlistId+externalId]",
      movies: "++id, playlistId, [playlistId+externalId], categoryId",
      series: "++id, playlistId, [playlistId+externalId], categoryId",
      tv: "++id, playlistId, [playlistId+externalId], categoryId",
      settings: "&key",
    });
  }
}

let _db: PlaylistDatabase | null = null;

/**
 * Retorna a instância singleton do banco.
 * A criação é adiada (lazy) para permitir que fake-indexeddb
 * seja registrado antes da primeira chamada em ambiente de teste.
 */
export function getDb(): PlaylistDatabase {
  if (!_db) {
    _db = new PlaylistDatabase();
  }
  return _db;
}

/**
 * Redefine a instância do banco (usado apenas em testes).
 */
export function resetDb(): void {
  if (_db) {
    _db.close();
    _db = null;
  }
}

/**
 * Cria uma nova instância de banco para testes isolados.
 */
export function createTestDb(name?: string): PlaylistDatabase {
  return new PlaylistDatabase(name || `test-db-${Date.now()}`);
}
