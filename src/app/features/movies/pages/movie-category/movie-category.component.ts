import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import { CategoryPageLoader } from "../../../../shared/data-access/content-pagination";
import { PosterCardComponent } from "../../../../shared/ui/poster-card/poster-card.component";
import { PosterCarouselItem } from "../../../../shared/ui/poster-carousel/poster-carousel.component";
import { MoviesService } from "../../data-access/services/movies.service";

@Component({
  selector: "app-movie-category",
  standalone: true,
  imports: [CommonModule, PosterCardComponent, LazyLoadTriggerDirective],
  templateUrl: "./movie-category.component.html",
  styleUrl: "./movie-category.component.scss",
})
export class MovieCategoryComponent implements OnInit {
  private moviesService = inject(MoviesService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playlistId: number | null = null;
  private categoryId = "";
  private readonly loader = new CategoryPageLoader<PosterCarouselItem>({
    pageSize: 24,
    getCategory: (playlistId, categoryId) => this.moviesService.getMovieCategory(playlistId, categoryId),
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

  readonly category = this.loader.category;
  readonly movies = this.loader.items;
  readonly hasMoreMovies = this.loader.hasMoreItems;
  readonly isLoading = this.loader.isLoading;

  @ViewChild(LazyLoadTriggerDirective) private loadTrigger?: LazyLoadTriggerDirective;

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    this.categoryId = this.route.snapshot.paramMap.get("categoryId") ?? "";
    await this.loader.init(this.playlistId, this.categoryId);
  }

  async loadMoreMovies(): Promise<void> {
    await this.loader.loadMore(this.playlistId, this.categoryId);
    this.loader.queueAnotherLoadIfNeeded(this.playlistId, this.categoryId, () => this.loadTrigger?.isNearViewport());
  }

  openMovie(movie: PosterCarouselItem): Promise<boolean> {
    return this.router.navigate(["/movies/movie", movie.externalId]);
  }
}
