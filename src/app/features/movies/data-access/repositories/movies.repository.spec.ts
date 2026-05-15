import "fake-indexeddb/auto";
import { TestBed } from "@angular/core/testing";
import { createTestDb, PlaylistDatabase } from "../../../../core/database/playlist.db";
import { MOVIES_DB, MoviesRepository } from "./movies.repository";

describe("MoviesRepository", () => {
  let db: PlaylistDatabase;
  let repository: MoviesRepository;

  beforeEach(async () => {
    db = createTestDb(`movies-repository-${crypto.randomUUID()}`);
    await db.open();
    TestBed.configureTestingModule({
      providers: [{ provide: MOVIES_DB, useValue: db }],
    });
    repository = TestBed.inject(MoviesRepository);
  });

  afterEach(async () => {
    await db.delete();
  });

  it("loads movie categories for the selected playlist", async () => {
    await db.categories.bulkAdd([
      {
        playlistId: 1,
        externalId: "10",
        name: "Action",
        type: "movie",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
      {
        playlistId: 1,
        externalId: "20",
        name: "Series",
        type: "series",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      },
    ]);

    const categories = await repository.getMovieCategories(1, 0, 10);

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe("Action");
  });

  it("loads paged movies by category", async () => {
    await db.movies.bulkAdd(
      Array.from({ length: 4 }, (_, index) => ({
        playlistId: 1,
        externalId: index + 1,
        categoryId: "10",
        name: `Movie ${index + 1}`,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      })),
    );

    const movies = await repository.getMoviesByCategory(1, "10", 1, 2);

    expect(movies.map((movie) => movie.name)).toEqual(["Movie 2", "Movie 3"]);
  });
});
