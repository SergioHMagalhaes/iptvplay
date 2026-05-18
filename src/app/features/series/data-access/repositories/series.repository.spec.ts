import "fake-indexeddb/auto";
import { TestBed } from "@angular/core/testing";
import { createTestDb, PlaylistDatabase } from "../../../../core/database/playlist.db";
import { SERIES_DB, SeriesRepository } from "./series.repository";

describe("SeriesRepository", () => {
  let db: PlaylistDatabase;
  let repository: SeriesRepository;

  beforeEach(async () => {
    db = createTestDb(`series-repository-${crypto.randomUUID()}`);
    await db.open();
    TestBed.configureTestingModule({
      providers: [{ provide: SERIES_DB, useValue: db }],
    });
    repository = TestBed.inject(SeriesRepository);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("loads series categories for the selected playlist", async () => {
    await db.categories.bulkAdd([
      {
        playlistId: 1,
        externalId: "10",
        name: "Drama",
        type: "series",
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

    const categories = await repository.getSeriesCategories(1, 0, 10);

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe("Drama");
  });

  it("loads paged series by category", async () => {
    await db.series.bulkAdd(
      Array.from({ length: 4 }, (_, index) => ({
        playlistId: 1,
        externalId: index + 1,
        categoryId: "10",
        name: `Series ${index + 1}`,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      })),
    );

    const series = await repository.getSeriesByCategory(1, "10", 1, 2);

    expect(series.map((item) => item.name)).toEqual(["Series 2", "Series 3"]);
  });
});
