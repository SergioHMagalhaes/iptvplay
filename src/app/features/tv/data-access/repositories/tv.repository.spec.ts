import "fake-indexeddb/auto";
import { TestBed } from "@angular/core/testing";
import { createTestDb, PlaylistDatabase } from "../../../../core/database/playlist.db";
import { LIVE_TV_DB, TvRepository } from "./tv.repository";

describe("TvRepository", () => {
  let db: PlaylistDatabase;
  let repository: TvRepository;

  beforeEach(async () => {
    db = createTestDb(`tv-repository-${crypto.randomUUID()}`);
    await db.open();
    TestBed.configureTestingModule({
      providers: [{ provide: LIVE_TV_DB, useValue: db }],
    });
    repository = TestBed.inject(TvRepository);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("loads live TV categories for the selected playlist", async () => {
    await db.categories.bulkAdd([
      {
        playlistId: 1,
        externalId: "10",
        name: "News",
        type: "tv",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
      {
        playlistId: 1,
        externalId: "20",
        name: "Movies",
        type: "movie",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ]);

    const categories = await repository.getChannelCategories(1, 0, 10);

    expect(categories.map((category) => category.name)).toEqual(["News"]);
  });

  it("loads paged channels by category", async () => {
    await db.tv.bulkAdd(
      Array.from({ length: 4 }, (_, index) => ({
        playlistId: 1,
        externalId: index + 1,
        categoryId: "10",
        name: `Channel ${index + 1}`,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      })),
    );

    const channels = await repository.getChannelsByCategory(1, "10", 1, 2);

    expect(channels.map((channel) => channel.name)).toEqual(["Channel 2", "Channel 3"]);
  });
});
