import { indexedDB, IDBKeyRange } from "fake-indexeddb";
import Dexie from "dexie";
import { TestBed } from "@angular/core/testing";
import { PlaylistDatabase } from "../database/playlist.db";
import { PlaylistContentRepository, PLAYLIST_CONTENT_DB } from "./playlist-content.repository";

describe("PlaylistContentRepository", () => {
  let db: PlaylistDatabase;
  let repository: PlaylistContentRepository;

  beforeEach(async () => {
    Dexie.dependencies.indexedDB = indexedDB;
    Dexie.dependencies.IDBKeyRange = IDBKeyRange;
    db = new PlaylistDatabase(`content-db-${Date.now()}`);
    await db.open();
    TestBed.configureTestingModule({
      providers: [{ provide: PLAYLIST_CONTENT_DB, useValue: db }],
    });
    repository = TestBed.inject(PlaylistContentRepository);
  });

  afterEach(async () => {
    db.close();
    await Dexie.delete(db.name);
  });

  it("replaces synchronized content for one playlist without touching another playlist", async () => {
    const now = new Date().toISOString();
    await repository.replaceAllForPlaylist(1, {
      categories: [{ playlistId: 1, externalId: "10", name: "News", type: "tv", createdAt: now, updatedAt: now }],
      movies: [{ playlistId: 1, externalId: 100, categoryId: "20", name: "Movie", createdAt: now, updatedAt: now }],
      series: [{ playlistId: 1, externalId: 200, categoryId: "30", name: "Series", createdAt: now, updatedAt: now }],
      tv: [{ playlistId: 1, externalId: 300, categoryId: "10", name: "Channel", createdAt: now, updatedAt: now }],
    });
    await repository.replaceAllForPlaylist(2, {
      categories: [{ playlistId: 2, externalId: "99", name: "Other", type: "tv", createdAt: now, updatedAt: now }],
      movies: [],
      series: [],
      tv: [],
    });

    await repository.replaceAllForPlaylist(1, {
      categories: [],
      movies: [],
      series: [],
      tv: [],
    });

    expect(await db.categories.where("playlistId").equals(1).count()).toBe(0);
    expect(await db.movies.where("playlistId").equals(1).count()).toBe(0);
    expect(await db.series.where("playlistId").equals(1).count()).toBe(0);
    expect(await db.tv.where("playlistId").equals(1).count()).toBe(0);
    expect(await db.categories.where("playlistId").equals(2).count()).toBe(1);
  });
});
