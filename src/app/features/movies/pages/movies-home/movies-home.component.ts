import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import { CategorySectionsLoader } from "../../../../shared/data-access/content-pagination";
import {
  PosterCarouselComponent,
  PosterCarouselItem,
} from "../../../../shared/ui/poster-carousel/poster-carousel.component";
import { MoviesService } from "../../data-access/services/movies.service";

@Component({
  selector: "app-movies-home",
  standalone: true,
  imports: [CommonModule, PosterCarouselComponent, LazyLoadTriggerDirective],
  templateUrl: "./movies-home.component.html",
  styleUrl: "./movies-home.component.scss",
})
export class MoviesHomeComponent implements OnInit {
  private moviesService = inject(MoviesService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private router = inject(Router);
  private playlistId: number | null = null;
  private readonly loader = new CategorySectionsLoader<PosterCarouselItem>({
    categoryPageSize: 8,
    itemPageSize: 12,
    errorMessage: "Não foi possível carregar os filmes.",
    getCategories: (playlistId, offset, limit) => this.moviesService.getMovieCategories(playlistId, offset, limit),
    getItemsByCategory: async (playlistId, categoryId, offset, limit) => {
      const movies = await this.moviesService.getMoviesByCategory(playlistId, categoryId, offset, limit);
      return movies.map((movie) => ({
        id: movie.id,
        externalId: movie.externalId,
        name: movie.name,
        imageUrl: movie.streamIcon,
      }));
    },
  });

  readonly sections = this.loader.sections;
  readonly isLoading = this.loader.isLoading;
  readonly hasMoreCategories = this.loader.hasMoreCategories;
  readonly errorMessage = this.loader.errorMessage;

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    await this.loadMoreCategories();
  }

  async loadMoreCategories(): Promise<void> {
    await this.loader.loadMoreCategories(this.playlistId);
  }

  async loadMoreMovies(categoryId: string): Promise<void> {
    await this.loader.loadMoreItems(this.playlistId, categoryId);
  }

  openCategory(categoryId: string): Promise<boolean> {
    return this.router.navigate(["/movies/category", categoryId]);
  }

  openMovie(movie: PosterCarouselItem): Promise<boolean> {
    return this.router.navigate(["/movies/movie", movie.externalId]);
  }
}
