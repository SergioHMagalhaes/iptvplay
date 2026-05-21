import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { vi } from "vitest";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { LiveTvService } from "../../data-access/services/tv.service";
import { TvCategoryComponent } from "./tv-category.component";

describe("TvCategoryComponent", () => {
  let fixture: ComponentFixture<TvCategoryComponent>;
  let component: TvCategoryComponent;
  let liveTvService: {
    getChannelCategory: ReturnType<typeof vi.fn>;
    getChannelsByCategory: ReturnType<typeof vi.fn>;
    getChannelPlaybackUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    liveTvService = {
      getChannelCategory: vi.fn().mockResolvedValue({
        externalId: "10",
        name: "News",
        playlistId: 1,
        type: "tv",
        createdAt: "2026-01-01",
        updatedAt: "2026-01-01",
      }),
      getChannelsByCategory: vi.fn().mockResolvedValue([
        {
          externalId: 7,
          categoryId: "10",
          playlistId: 1,
          name: "Channel 7",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
      getChannelPlaybackUrl: vi.fn().mockResolvedValue("https://iptv.test/live/u/p/7.m3u8"),
    };

    await TestBed.configureTestingModule({
      imports: [TvCategoryComponent],
      providers: [
        { provide: LiveTvService, useValue: liveTvService },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(1) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ categoryId: "10" }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TvCategoryComponent);
    component = fixture.componentInstance;
  });

  it("loads category metadata and first channel page", async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(liveTvService.getChannelCategory).toHaveBeenCalledWith(1, "10");
    expect(liveTvService.getChannelsByCategory).toHaveBeenCalledWith(1, "10", 0, 24);
  });

  it("opens selected channel in the player modal", async () => {
    await component.openChannel({ externalId: 7, name: "Channel 7" });
    fixture.detectChanges();

    expect(component.playbackUrl()).toBe("https://iptv.test/live/u/p/7.m3u8");
    expect(fixture.nativeElement.querySelector("app-video-player-modal")).not.toBeNull();
  });
});
