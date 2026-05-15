import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { IptvCategory, IptvMovie } from "../../../../core/models/iptv-content.model";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import { MoviesService } from "../../data-access/services/movies.service";
import { MovieCarouselComponent } from "../../ui/movie-carousel/movie-carousel.component";

interface MovieSection {
  category: IptvCategory;
  movies: IptvMovie[];
  hasMoreMovies: boolean;
  isLoadingMovies: boolean;
}

@Component({
  selector: "app-movies-home",
  standalone: true,
  imports: [CommonModule, MovieCarouselComponent, LazyLoadTriggerDirective],
  templateUrl: "./movies-home.component.html",
  styleUrl: "./movies-home.component.scss",
})
export class MoviesHomeComponent implements OnInit {
  private readonly categoryPageSize = 8;
  private readonly moviePageSize = 12;
  private moviesService = inject(MoviesService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private router = inject(Router);
  private playlistId: number | null = null;

  readonly sections = signal<MovieSection[]>([]);
  readonly isLoading = signal(false);
  readonly hasMoreCategories = signal(true);
  readonly errorMessage = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    await this.loadMoreCategories();
  }

  async loadMoreCategories(): Promise<void> {
    const playlistId = this.playlistId;
    if (this.isLoading() || !this.hasMoreCategories() || playlistId === null) {
      return;
    }

    this.isLoading.set(true);
    try {
      const offset = this.sections().length;
      const categories = await this.moviesService.getMovieCategories(playlistId, offset, this.categoryPageSize);
      const newSections = await Promise.all(
        categories.map(async (category) => {
          const movies = await this.moviesService.getMoviesByCategory(
            playlistId,
            category.externalId,
            0,
            this.moviePageSize,
          );
          return {
            category,
            movies,
            hasMoreMovies: movies.length === this.moviePageSize,
            isLoadingMovies: false,
          };
        }),
      );
      this.sections.update((sections) => [...sections, ...newSections]);
      this.hasMoreCategories.set(categories.length === this.categoryPageSize);
    } catch (error) {
      this.errorMessage.set(error instanceof Error ? error.message : "Não foi possível carregar os filmes.");
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMoreMovies(categoryId: string): Promise<void> {
    if (this.playlistId === null) return;
    const section = this.sections().find((item) => item.category.externalId === categoryId);
    if (!section || section.isLoadingMovies || !section.hasMoreMovies) return;

    this.patchSection(categoryId, { isLoadingMovies: true });
    const movies = await this.moviesService.getMoviesByCategory(
      this.playlistId,
      categoryId,
      section.movies.length,
      this.moviePageSize,
    );
    this.patchSection(categoryId, {
      movies: [...section.movies, ...movies],
      hasMoreMovies: movies.length === this.moviePageSize,
      isLoadingMovies: false,
    });
  }

  openCategory(categoryId: string): Promise<boolean> {
    return this.router.navigate(["/movies/category", categoryId]);
  }

  private patchSection(categoryId: string, patch: Partial<MovieSection>): void {
    this.sections.update((sections) =>
      sections.map((section) => (section.category.externalId === categoryId ? { ...section, ...patch } : section)),
    );
  }
}
