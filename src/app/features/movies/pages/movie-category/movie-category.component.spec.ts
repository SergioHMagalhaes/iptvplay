import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { vi } from "vitest";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { MoviesService } from "../../data-access/services/movies.service";
import { MovieCategoryComponent } from "./movie-category.component";

describe("MovieCategoryComponent", () => {
  let fixture: ComponentFixture<MovieCategoryComponent>;
  let component: MovieCategoryComponent;
  let moviesService: {
    getMovieCategory: ReturnType<typeof vi.fn>;
    getMoviesByCategory: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    moviesService = {
      getMovieCategory: vi.fn().mockResolvedValue({
        externalId: "10",
        name: "Action",
        playlistId: 1,
        type: "movie",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      }),
      getMoviesByCategory: vi.fn().mockResolvedValue([
        {
          externalId: 1,
          categoryId: "10",
          playlistId: 1,
          name: "Movie 1",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [MovieCategoryComponent],
      providers: [
        { provide: MoviesService, useValue: moviesService },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(1) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ categoryId: "10" }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCategoryComponent);
    component = fixture.componentInstance;
  });

  it("loads category metadata and the first movie page", async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(moviesService.getMovieCategory).toHaveBeenCalledWith(1, "10");
    expect(moviesService.getMoviesByCategory).toHaveBeenCalledWith(1, "10", 0, 24);
  });

  it("loads the next page on lazy load", async () => {
    moviesService.getMoviesByCategory.mockResolvedValueOnce(
      Array.from({ length: 24 }, (_, index) => ({
        externalId: index + 1,
        categoryId: "10",
        playlistId: 1,
        name: `Movie ${index + 1}`,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      })),
    );
    component.ngOnInit();
    await fixture.whenStable();
    moviesService.getMoviesByCategory.mockResolvedValueOnce([]);

    await component.loadMoreMovies();

    expect(moviesService.getMoviesByCategory).toHaveBeenLastCalledWith(1, "10", 24, 24);
  });
});
