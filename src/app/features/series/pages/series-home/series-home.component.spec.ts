import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { SeriesService } from "../../data-access/services/series.service";
import { SeriesHomeComponent } from "./series-home.component";

describe("SeriesHomeComponent", () => {
  let fixture: ComponentFixture<SeriesHomeComponent>;
  let component: SeriesHomeComponent;
  let router: Router;
  let seriesService: {
    getSeriesCategories: ReturnType<typeof vi.fn>;
    getSeriesByCategory: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    seriesService = {
      getSeriesCategories: vi.fn().mockResolvedValue([
        {
          externalId: "10",
          name: "Drama",
          playlistId: 1,
          type: "series",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
      getSeriesByCategory: vi.fn().mockResolvedValue([
        {
          externalId: 1,
          categoryId: "10",
          playlistId: 1,
          name: "Series 1",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
    };

    await TestBed.configureTestingModule({
      imports: [SeriesHomeComponent],
      providers: [
        { provide: SeriesService, useValue: seriesService },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(1) } },
        provideRouter([{ path: "series/category/:categoryId", children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesHomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it("loads categories and initial series on init", async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(seriesService.getSeriesCategories).toHaveBeenCalledWith(1, 0, 8);
    expect(seriesService.getSeriesByCategory).toHaveBeenCalledWith(1, "10", 0, 12);
    expect(component.sections()).toHaveLength(1);
  });

  it("loads the next category page when the vertical sentinel is reached", async () => {
    seriesService.getSeriesCategories
      .mockResolvedValueOnce(
        Array.from({ length: 8 }, (_, index) => ({
          externalId: `${index + 10}`,
          name: `Category ${index + 1}`,
          playlistId: 1,
          type: "series" as const,
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        })),
      )
      .mockResolvedValueOnce([]);

    component.ngOnInit();
    await fixture.whenStable();
    await component.loadMoreCategories();

    expect(seriesService.getSeriesCategories).toHaveBeenLastCalledWith(1, 8, 8);
  });

  it("loads more series for a slider when it reaches the horizontal end", async () => {
    seriesService.getSeriesByCategory.mockResolvedValueOnce(
      Array.from({ length: 12 }, (_, index) => ({
        externalId: index + 1,
        categoryId: "10",
        playlistId: 1,
        name: `Series ${index + 1}`,
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      })),
    );
    component.ngOnInit();
    await fixture.whenStable();
    seriesService.getSeriesByCategory.mockResolvedValueOnce([]);

    await component.loadMoreSeries("10");

    expect(seriesService.getSeriesByCategory).toHaveBeenLastCalledWith(1, "10", 12, 12);
  });

  it("navigates to the full category screen from see more", async () => {
    const navigateSpy = vi.spyOn(router, "navigate");

    await component.openCategory("10");

    expect(navigateSpy).toHaveBeenCalledWith(["/series/category", "10"]);
  });
});
