import Dexie, { Table } from "dexie";
import { PlaylistEntry } from "../models/playlist.model";

export class PlaylistDatabase extends Dexie {
  playlists!: Table<PlaylistEntry, number>;

  constructor(dbName = "iptvplay-db") {
    super(dbName);
    this.version(1).stores({
      playlists: "++id, &name, sourceType",
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
