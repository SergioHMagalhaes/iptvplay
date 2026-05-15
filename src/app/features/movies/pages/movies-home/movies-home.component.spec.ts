import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { MoviesService } from "../../data-access/services/movies.service";
import { MoviesHomeComponent } from "./movies-home.component";

describe("MoviesHomeComponent", () => {
  let fixture: ComponentFixture<MoviesHomeComponent>;
  let component: MoviesHomeComponent;
  let router: Router;
  let moviesService: {
    getMovieCategories: ReturnType<typeof vi.fn>;
    getMoviesByCategory: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    moviesService = {
      getMovieCategories: vi.fn().mockResolvedValue([
        {
          externalId: "10",
          name: "Action",
          playlistId: 1,
          type: "movie",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
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
      imports: [MoviesHomeComponent],
      providers: [
        { provide: MoviesService, useValue: moviesService },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(1) } },
        provideRouter([{ path: "movies/category/:categoryId", children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MoviesHomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it("loads categories and initial movies on init", async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(moviesService.getMovieCategories).toHaveBeenCalledWith(1, 0, 8);
    expect(moviesService.getMoviesByCategory).toHaveBeenCalledWith(1, "10", 0, 12);
    expect(component.sections()).toHaveLength(1);
  });

  it("loads the next category page when the vertical sentinel is reached", async () => {
    moviesService.getMovieCategories
      .mockResolvedValueOnce(
        Array.from({ length: 8 }, (_, index) => ({
          externalId: `${index + 10}`,
          name: `Category ${index + 1}`,
          playlistId: 1,
          type: "movie" as const,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        })),
      )
      .mockResolvedValueOnce([]);

    component.ngOnInit();
    await fixture.whenStable();
    await component.loadMoreCategories();

    expect(moviesService.getMovieCategories).toHaveBeenLastCalledWith(1, 8, 8);
  });

  it("loads more movies for a slider when it reaches the horizontal end", async () => {
    moviesService.getMoviesByCategory.mockResolvedValueOnce(
      Array.from({ length: 12 }, (_, index) => ({
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

    await component.loadMoreMovies("10");

    expect(moviesService.getMoviesByCategory).toHaveBeenLastCalledWith(1, "10", 12, 12);
  });

  it("navigates to the full category screen from see more", async () => {
    const navigateSpy = vi.spyOn(router, "navigate");

    await component.openCategory("10");

    expect(navigateSpy).toHaveBeenCalledWith(["/movies/category", "10"]);
  });
});
