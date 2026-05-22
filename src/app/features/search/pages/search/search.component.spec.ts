import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { SearchResult, SearchService } from "../../data-access/services/search.service";
import { SearchComponent } from "./search.component";

describe("SearchComponent", () => {
  let fixture: ComponentFixture<SearchComponent>;
  let router: Router;
  let searchService: {
    search: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    searchService = {
      search: vi.fn().mockResolvedValue([result("movie", "Ação Total", 21)]),
    };

    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        { provide: SearchService, useValue: searchService },
        provideRouter([
          { path: "movies/movie/:externalId", children: [] },
          { path: "series/series/:externalId", children: [] },
          { path: "tv/channel/:externalId", children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it("renders matching results with poster cards", async () => {
    await typeQuery("acao");

    const cards = host().querySelectorAll("app-poster-card");

    expect(searchService.search).toHaveBeenCalledWith("acao");
    expect(cards).toHaveLength(1);
  });

  it("shows loading and empty states", async () => {
    let finishSearch: (results: SearchResult[]) => void = () => undefined;
    searchService.search.mockReturnValueOnce(new Promise<SearchResult[]>((resolve) => (finishSearch = resolve)));

    await typeQuery("lost", false);

    expect(fixture.nativeElement.textContent).toContain("Buscando");

    finishSearch([]);
    await Promise.resolve();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain("Nenhum resultado");
  });

  it("shows a request error state when search fails", async () => {
    searchService.search.mockRejectedValueOnce(new Error("db unavailable"));

    await typeQuery("news");

    expect(fixture.nativeElement.textContent).toContain("Não foi possível buscar");
  });

  it("navigates search cards to their details routes", async () => {
    searchService.search.mockResolvedValueOnce([
      result("movie", "Ação Total", 21),
      result("series", "Heroes", 22),
      result("tv", "Notícias 24H", 23),
    ]);
    const navigateSpy = vi.spyOn(router, "navigate");

    await typeQuery("a");

    const buttons = host().querySelectorAll<HTMLButtonElement>("[data-testid='search-result']");
    buttons[0].click();
    buttons[1].click();
    buttons[2].click();

    expect(navigateSpy).toHaveBeenNthCalledWith(1, ["/movies/movie", 21]);
    expect(navigateSpy).toHaveBeenNthCalledWith(2, ["/series/series", 22]);
    expect(navigateSpy).toHaveBeenNthCalledWith(3, ["/tv/channel", 23]);
  });

  async function typeQuery(value: string, waitForSearch = true): Promise<void> {
    const input = host().querySelector<HTMLInputElement>("input[type='search']");
    if (!input) throw new Error("Search input missing.");

    input.value = value;
    input.dispatchEvent(new Event("input"));
    await fixture.whenStable();

    if (waitForSearch) {
      await fixture.whenStable();
    }
  }

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});

function result(kind: SearchResult["kind"], name: string, externalId: number): SearchResult {
  return {
    externalId,
    imageUrl: `/${externalId}.jpg`,
    kind,
    name,
  };
}
