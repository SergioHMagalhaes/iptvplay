import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { vi } from "vitest";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { SeriesService } from "../../data-access/services/series.service";
import { SeriesCategoryComponent } from "./series-category.component";

describe("SeriesCategoryComponent", () => {
  let fixture: ComponentFixture<SeriesCategoryComponent>;
  let component: SeriesCategoryComponent;
  let seriesService: {
    getSeriesCategory: ReturnType<typeof vi.fn>;
    getSeriesByCategory: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    seriesService = {
      getSeriesCategory: vi.fn().mockResolvedValue({
        externalId: "10",
        name: "Drama",
        playlistId: 1,
        type: "series",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      }),
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
      imports: [SeriesCategoryComponent],
      providers: [
        { provide: SeriesService, useValue: seriesService },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(1) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ categoryId: "10" }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesCategoryComponent);
    component = fixture.componentInstance;
  });

  it("loads category metadata and the first series page", async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(seriesService.getSeriesCategory).toHaveBeenCalledWith(1, "10");
    expect(seriesService.getSeriesByCategory).toHaveBeenCalledWith(1, "10", 0, 24);
  });

  it("loads the next page on lazy load", async () => {
    seriesService.getSeriesByCategory.mockResolvedValueOnce(
      Array.from({ length: 24 }, (_, index) => ({
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

    await component.loadMoreSeries();

    expect(seriesService.getSeriesByCategory).toHaveBeenLastCalledWith(1, "10", 24, 24);
  });
});
