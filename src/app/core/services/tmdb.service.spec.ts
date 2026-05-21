import { TestBed } from "@angular/core/testing";
import { TmdbService } from "./tmdb.service";

describe("TmdbService", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let service: TmdbService;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    TestBed.configureTestingModule({});
    service = TestBed.inject(TmdbService);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("searches through the local API proxy with a sanitized title", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ results: [{ id: 7 }] })));

    await service.search("movie", "007: No Time to Die (2021) [4K]");

    expect(fetchSpy).toHaveBeenCalledWith("/api/tmdb/search?type=movie&query=007%3A+No+Time+to+Die");
  });

  it("loads season metadata through the local API proxy", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify({ episodes: [] })));

    await service.getSeason(12, 2);

    expect(fetchSpy).toHaveBeenCalledWith("/api/tmdb/season?seriesId=12&season=2");
  });
});
