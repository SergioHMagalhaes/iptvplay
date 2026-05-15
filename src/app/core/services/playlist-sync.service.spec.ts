import { TestBed } from "@angular/core/testing";
import { PlaylistSyncService } from "./playlist-sync.service";
import { XtreamApiService } from "./xtream-api.service";
import { PlaylistContentRepository } from "../repositories/playlist-content.repository";
import { PlaylistEntry } from "../models/playlist.model";
import { vi } from "vitest";

describe("PlaylistSyncService", () => {
  let service: PlaylistSyncService;
  let xtreamApi: {
    fetchTvCategories: ReturnType<typeof vi.fn>;
    fetchMovieCategories: ReturnType<typeof vi.fn>;
    fetchSeriesCategories: ReturnType<typeof vi.fn>;
    fetchMovies: ReturnType<typeof vi.fn>;
    fetchSeries: ReturnType<typeof vi.fn>;
    fetchTv: ReturnType<typeof vi.fn>;
  };
  let repository: { replaceAllForPlaylist: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    xtreamApi = {
      fetchTvCategories: vi.fn(),
      fetchMovieCategories: vi.fn(),
      fetchSeriesCategories: vi.fn(),
      fetchMovies: vi.fn(),
      fetchSeries: vi.fn(),
      fetchTv: vi.fn(),
    };
    repository = {
      replaceAllForPlaylist: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        PlaylistSyncService,
        { provide: XtreamApiService, useValue: xtreamApi },
        { provide: PlaylistContentRepository, useValue: repository },
      ],
    });

    service = TestBed.inject(PlaylistSyncService);
  });

  it("fetches Xtream collections and persists normalized local content", async () => {
    const playlist = createXtreamPlaylist();
    xtreamApi.fetchTvCategories.mockResolvedValue([{ category_id: "1", category_name: "Live" }]);
    xtreamApi.fetchMovieCategories.mockResolvedValue([{ category_id: "2", category_name: "Movies" }]);
    xtreamApi.fetchSeriesCategories.mockResolvedValue([{ category_id: "3", category_name: "Series" }]);
    xtreamApi.fetchMovies.mockResolvedValue([{ stream_id: 10, category_id: "2", name: "Movie A" }]);
    xtreamApi.fetchSeries.mockResolvedValue([{ series_id: 20, category_id: "3", name: "Series A" }]);
    xtreamApi.fetchTv.mockResolvedValue([{ stream_id: 30, category_id: "1", name: "Channel A" }]);

    await service.syncPlaylist(playlist);

    expect(repository.replaceAllForPlaylist).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({ playlistId: 7, externalId: "1", name: "Live", type: "tv" }),
          expect.objectContaining({ playlistId: 7, externalId: "2", name: "Movies", type: "movie" }),
          expect.objectContaining({ playlistId: 7, externalId: "3", name: "Series", type: "series" }),
        ]),
        movies: [expect.objectContaining({ externalId: 10, name: "Movie A" })],
        series: [expect.objectContaining({ externalId: 20, name: "Series A" })],
        tv: [expect.objectContaining({ externalId: 30, name: "Channel A" })],
      }),
    );
  });

  it("rejects playlists that are not Xtream based", async () => {
    await expect(
      service.syncPlaylist({
        id: 8,
        name: "M3U",
        sourceType: "m3u_url",
        url: "https://example.com/list.m3u",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    ).rejects.toThrow("A sincronização automática exige uma playlist Xtream.");
  });
});

function createXtreamPlaylist(): PlaylistEntry {
  return {
    id: 7,
    name: "Xtream",
    sourceType: "xtream",
    domain: "https://provider.example",
    username: "user",
    password: "pass",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
