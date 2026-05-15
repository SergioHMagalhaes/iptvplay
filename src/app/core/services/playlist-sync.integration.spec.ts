import { TestBed } from "@angular/core/testing";
import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import Dexie from "dexie";
import { vi } from "vitest";
import { PlaylistDatabase } from "../database/playlist.db";
import { PLAYLIST_DB } from "./playlist.service";
import { XtreamApiService } from "./xtream-api.service";
import { PlaylistSyncService } from "./playlist-sync.service";
import { PlaylistEntry } from "../models/playlist.model";

describe("PlaylistSyncService integration", () => {
  let db: PlaylistDatabase;
  let service: PlaylistSyncService;

  beforeEach(async () => {
    Dexie.dependencies.indexedDB = indexedDB;
    Dexie.dependencies.IDBKeyRange = IDBKeyRange;
    db = new PlaylistDatabase(`sync-db-${Date.now()}`);
    await db.open();

    TestBed.configureTestingModule({
      providers: [
        { provide: PLAYLIST_DB, useValue: db },
        {
          provide: XtreamApiService,
          useValue: {
            fetchTvCategories: vi.fn().mockResolvedValue([{ category_id: "1", category_name: "Live" }]),
            fetchMovieCategories: vi.fn().mockResolvedValue([{ category_id: "2", category_name: "Movies" }]),
            fetchSeriesCategories: vi.fn().mockResolvedValue([{ category_id: "3", category_name: "Series" }]),
            fetchMovies: vi.fn().mockResolvedValue([{ stream_id: 10, category_id: "2", name: "Movie" }]),
            fetchSeries: vi.fn().mockResolvedValue([{ series_id: 20, category_id: "3", name: "Series" }]),
            fetchTv: vi.fn().mockResolvedValue([{ stream_id: 30, category_id: "1", name: "Channel" }]),
          },
        },
      ],
    });

    service = TestBed.inject(PlaylistSyncService);
  });

  afterEach(async () => {
    db.close();
    await Dexie.delete(db.name);
  });

  it("stores synchronized Xtream data in IndexedDB collections", async () => {
    await service.syncPlaylist(createPlaylist());

    expect(await db.categories.count()).toBe(3);
    expect(await db.movies.count()).toBe(1);
    expect(await db.series.count()).toBe(1);
    expect(await db.tv.count()).toBe(1);
  });
});

function createPlaylist(): PlaylistEntry {
  return {
    id: 11,
    name: "Integrated",
    sourceType: "xtream",
    domain: "https://provider.example",
    username: "user",
    password: "pass",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
