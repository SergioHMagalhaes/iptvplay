import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { LiveTvService } from "../../data-access/services/tv.service";
import { TvHomeComponent } from "./tv-home.component";

describe("TvHomeComponent", () => {
  let fixture: ComponentFixture<TvHomeComponent>;
  let component: TvHomeComponent;
  let router: Router;
  let liveTvService: {
    getChannelCategories: ReturnType<typeof vi.fn>;
    getChannelsByCategory: ReturnType<typeof vi.fn>;
    getChannelPlaybackUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    liveTvService = {
      getChannelCategories: vi.fn().mockResolvedValue([
        {
          externalId: "10",
          name: "News",
          playlistId: 1,
          type: "tv",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ]),
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
      imports: [TvHomeComponent],
      providers: [
        { provide: LiveTvService, useValue: liveTvService },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(1) } },
        provideRouter([{ path: "tv/category/:categoryId", children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TvHomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it("loads channel categories and initial channels on init", async () => {
    component.ngOnInit();
    await fixture.whenStable();

    expect(liveTvService.getChannelCategories).toHaveBeenCalledWith(1, 0, 8);
    expect(liveTvService.getChannelsByCategory).toHaveBeenCalledWith(1, "10", 0, 12);
    expect(component.sections()).toHaveLength(1);
  });

  it("navigates to the full channel category from see more", async () => {
    const navigateSpy = vi.spyOn(router, "navigate");

    await component.openCategory("10");

    expect(navigateSpy).toHaveBeenCalledWith(["/tv/category", "10"]);
  });

  it("opens channel playback in a modal without navigating to details", async () => {
    const navigateSpy = vi.spyOn(router, "navigate");

    await component.openChannel({ externalId: 7, name: "Channel 7" });
    fixture.detectChanges();

    expect(liveTvService.getChannelPlaybackUrl).toHaveBeenCalledWith(7);
    expect(component.playbackUrl()).toBe("https://iptv.test/live/u/p/7.m3u8");
    expect(fixture.nativeElement.querySelector("app-video-player-modal")).not.toBeNull();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
