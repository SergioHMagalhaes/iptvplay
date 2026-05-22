import { CommonModule } from "@angular/common";
import { Component, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { LUCIDE_ICONS } from "../../../../shared/icons/lucide-icons";
import { PosterCardComponent } from "../../../../shared/ui/poster-card/poster-card.component";
import { SearchResult, SearchService } from "../../data-access/services/search.service";

@Component({
  selector: "app-search",
  standalone: true,
  imports: [CommonModule, LUCIDE_ICONS, PosterCardComponent],
  templateUrl: "./search.component.html",
})
export class SearchComponent {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private searchRequestId = 0;

  readonly query = signal("");
  readonly results = signal<SearchResult[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasQuery = computed(() => this.query().trim().length > 0);
  readonly hasResults = computed(() => this.results().length > 0);

  onQueryInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.query.set(query);
    void this.search(query);
  }

  openResult(result: SearchResult): Promise<boolean> {
    switch (result.kind) {
      case "movie":
        return this.router.navigate(["/movies/movie", result.externalId]);
      case "series":
        return this.router.navigate(["/series/series", result.externalId]);
      case "tv":
        return this.router.navigate(["/tv/channel", result.externalId]);
    }
  }

  private async search(query: string): Promise<void> {
    const requestId = ++this.searchRequestId;
    this.errorMessage.set(null);

    if (!query.trim()) {
      this.results.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    try {
      const results = await this.searchService.search(query);
      if (requestId === this.searchRequestId) {
        this.results.set(results);
      }
    } catch {
      if (requestId === this.searchRequestId) {
        this.results.set([]);
        this.errorMessage.set("Não foi possível buscar agora.");
      }
    } finally {
      if (requestId === this.searchRequestId) {
        this.isLoading.set(false);
      }
    }
  }
}
