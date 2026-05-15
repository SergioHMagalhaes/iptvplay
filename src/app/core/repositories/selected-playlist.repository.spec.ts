import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import Dexie from "dexie";
import { TestBed } from "@angular/core/testing";
import { PlaylistDatabase } from "../database/playlist.db";
import { SelectedPlaylistRepository, SELECTED_PLAYLIST_DB } from "./selected-playlist.repository";

describe("SelectedPlaylistRepository", () => {
  let db: PlaylistDatabase;
  let repository: SelectedPlaylistRepository;

  beforeEach(async () => {
    Dexie.dependencies.indexedDB = indexedDB;
    Dexie.dependencies.IDBKeyRange = IDBKeyRange;
    db = new PlaylistDatabase(`selection-db-${Date.now()}`);
    await db.open();
    TestBed.configureTestingModule({
      providers: [{ provide: SELECTED_PLAYLIST_DB, useValue: db }],
    });
    repository = TestBed.inject(SelectedPlaylistRepository);
  });

  afterEach(async () => {
    db.close();
    await Dexie.delete(db.name);
  });

  it("persists and restores the selected playlist id", async () => {
    await repository.setSelectedPlaylistId(42);

    expect(await repository.getSelectedPlaylistId()).toBe(42);
  });
});
