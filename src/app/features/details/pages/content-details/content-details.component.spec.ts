import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap } from "@angular/router";
import { vi } from "vitest";
import { TmdbService } from "../../../../core/services/tmdb.service";
import { ContentDetailsService } from "../../data-access/content-details.service";
import { VideoPlayerService } from "../../data-access/video-player.service";
import { ContentDetailsComponent } from "./content-details.component";

describe("ContentDetailsComponent", () => {
  let fixture: ComponentFixture<ContentDetailsComponent>;
  let component: ContentDetailsComponent;
  let detailsService: {
    getDetails: ReturnType<typeof vi.fn>;
    getSeriesEpisodes: ReturnType<typeof vi.fn>;
    getPlaybackUrl: ReturnType<typeof vi.fn>;
  };
  let tmdbService: {
    search: ReturnType<typeof vi.fn>;
    getSeason: ReturnType<typeof vi.fn>;
    imageUrl: ReturnType<typeof vi.fn>;
  };
  let videoPlayer: {
    play: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    detailsService = {
      getDetails: vi.fn().mockResolvedValue({
        kind: "series",
        externalId: 10,
        name: "The Last of Us (2023) [FHD]",
        fallbackImage: "/cover.jpg",
        synopsis: "Playlist plot",
      }),
      getSeriesEpisodes: vi
        .fn()
        .mockResolvedValue([
          { id: 101, season: 1, episodeNumber: 1, title: "Piya Wiconi", image: "/episode.jpg", duration: "29:38" },
        ]),
      getPlaybackUrl: vi.fn().mockResolvedValue("https://iptv.test/series/u/p/101.mp4"),
    };
    tmdbService = {
      search: vi.fn().mockResolvedValue({
        id: 99,
        title: "The Last of Us",
        overview: "TMDB synopsis",
        backdropPath: "/backdrop.jpg",
        logoPath: "/logo.png",
        year: "2023",
        voteAverage: 8.7,
        genres: ["Drama"],
        numberOfSeasons: 2,
      }),
      getSeason: vi.fn().mockResolvedValue({
        seasonNumber: 1,
        episodes: [{ episodeNumber: 1, title: "When You're Lost", stillPath: "/still.jpg", duration: 47 }],
      }),
      imageUrl: vi.fn((path: string) => `https://image.tmdb.org/t/p/original${path}`),
    };
    videoPlayer = {
      play: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ContentDetailsComponent],
      providers: [
        { provide: ContentDetailsService, useValue: detailsService },
        { provide: TmdbService, useValue: tmdbService },
        { provide: VideoPlayerService, useValue: videoPlayer },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ kind: "series", externalId: "10" }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContentDetailsComponent);
    component = fixture.componentInstance;
  });

  it("loads TMDB details and season episodes for a series", async () => {
    await component.ngOnInit();

    expect(detailsService.getDetails).toHaveBeenCalledWith("series", 10);
    expect(tmdbService.search).toHaveBeenCalledWith("series", "The Last of Us (2023) [FHD]");
    expect(tmdbService.getSeason).toHaveBeenCalledWith(99, 1);
    expect(component.episodes()[0].title).toBe("When You're Lost");
    expect(component.bannerUrl()).toBe("https://image.tmdb.org/t/p/original/backdrop.jpg");
  });

  it("reloads episodes when the selected season changes", async () => {
    await component.ngOnInit();

    await component.selectSeason(2);

    expect(tmdbService.getSeason).toHaveBeenLastCalledWith(99, 2);
  });

  it("starts playback automatically when an episode is clicked", async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    await component.playEpisode(component.episodes()[0]);

    expect(detailsService.getPlaybackUrl).toHaveBeenCalledWith("series", 101);
    const [mediaElement, src] = videoPlayer.play.mock.calls[0];
    expect(mediaElement.tagName.toLowerCase()).toBe("video");
    expect(mediaElement.isConnected).toBe(true);
    expect(src).toBe("https://iptv.test/series/u/p/101.mp4");
    expect(component.isPlayerOpen()).toBe(true);
    expect(fixture.nativeElement.querySelector("[role='dialog']")).toBeNull();
  });

  it("uses the same native video element for HLS streams", async () => {
    detailsService.getPlaybackUrl.mockResolvedValueOnce("https://iptv.test/live/playlist.m3u8");
    await component.ngOnInit();
    fixture.detectChanges();

    await component.playEpisode(component.episodes()[0]);
    fixture.detectChanges();

    const video = fixture.nativeElement.querySelector("video.video-js");
    expect(video).not.toBeNull();
    expect(video.getAttribute("src")).toBe("https://iptv.test/live/playlist.m3u8");
    expect(customElementNames(fixture.nativeElement)).toEqual([]);
  });

  it("renders the banner with twenty percent opacity and a cinematic gradient", async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector("[data-testid='details-banner']");
    const gradient = fixture.nativeElement.querySelector("[data-testid='details-gradient']");

    expect(banner.className).toContain("opacity-20");
    expect(gradient.className).toContain("#00060f");
  });
});

function customElementNames(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll("*"))
    .map((element) => element.tagName.toLowerCase())
    .filter((tagName) => tagName.includes("-"));
}
