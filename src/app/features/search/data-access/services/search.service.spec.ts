import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import { IptvMovie, IptvSeries, IptvTvChannel } from "../../../../core/models/iptv-content.model";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { SearchRepository } from "../repositories/search.repository";
import { SearchService } from "./search.service";

describe("SearchService", () => {
  let service: SearchService;
  let repository: {
    getSearchableContent: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    repository = {
      getSearchableContent: vi.fn().mockResolvedValue({
        movies: [movie("Ação Total", 1), movie("Interstellar", 2)],
        series: [series("Heroes", 3)],
        tv: [channel("Notícias 24H", 4)],
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: SearchRepository, useValue: repository },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(8) } },
      ],
    });
    service = TestBed.inject(SearchService);
  });

  it("returns the best match first", async () => {
    repository.getSearchableContent.mockResolvedValue({
      movies: [
        movie("O Laboratório de Dexter", 1), // score 3
        movie("Dexter", 3), // score 0
      ],
      series: [movie("Dexter 2006", 2)], // score 1,
      tv: [movie("Dexter New Blood", 4)], // score 2,
    });

    const results = await service.search("dexter");

    expect(results.map((result) => result.name)).toEqual([
      "Dexter",
      "Dexter 2006",
      "Dexter New Blood",
      "O Laboratório de Dexter",
    ]);
  });

  it("matches accents, letter case, singular forms, and typos", async () => {
    await expect(service.search("ACAO")).resolves.toEqual([expect.objectContaining({ name: "Ação Total" })]);
    await expect(service.search("hero")).resolves.toEqual([expect.objectContaining({ name: "Heroes" })]);
    await expect(service.search("interstelar")).resolves.toEqual([expect.objectContaining({ name: "Interstellar" })]);
  });

  it("returns no result when no playlist is selected", async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: SearchRepository, useValue: repository },
        { provide: SelectedPlaylistService, useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(null) } },
      ],
    });

    const emptyService = TestBed.inject(SearchService);

    await expect(emptyService.search("ação")).resolves.toEqual([]);
    expect(repository.getSearchableContent).not.toHaveBeenCalled();
  });
});

function movie(name: string, externalId: number): IptvMovie {
  return {
    categoryId: "10",
    createdAt: "2026-01-01",
    externalId,
    name,
    playlistId: 8,
    updatedAt: "2026-01-01",
  };
}

function series(name: string, externalId: number): IptvSeries {
  return {
    categoryId: "20",
    createdAt: "2026-01-01",
    externalId,
    name,
    playlistId: 8,
    updatedAt: "2026-01-01",
  };
}

function channel(name: string, externalId: number): IptvTvChannel {
  return {
    categoryId: "30",
    createdAt: "2026-01-01",
    externalId,
    name,
    playlistId: 8,
    updatedAt: "2026-01-01",
  };
}
