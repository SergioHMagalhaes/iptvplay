import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IptvCategory, IptvMovie } from "../../../../core/models/iptv-content.model";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import { MoviesService } from "../../data-access/services/movies.service";
import { MovieCardComponent } from "../../ui/movie-card/movie-card.component";

@Component({
  selector: "app-movie-category",
  standalone: true,
  imports: [CommonModule, MovieCardComponent, LazyLoadTriggerDirective],
  templateUrl: "./movie-category.component.html",
  styleUrl: "./movie-category.component.scss",
})
export class MovieCategoryComponent implements OnInit {
  private readonly pageSize = 24;
  private moviesService = inject(MoviesService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private route = inject(ActivatedRoute);
  private playlistId: number | null = null;
  private categoryId = "";

  readonly category = signal<IptvCategory | undefined>(undefined);
  readonly movies = signal<IptvMovie[]>([]);
  readonly hasMoreMovies = signal(true);
  readonly isLoading = signal(false);

  @ViewChild(LazyLoadTriggerDirective) private loadTrigger?: LazyLoadTriggerDirective;

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    this.categoryId = this.route.snapshot.paramMap.get("categoryId") ?? "";
    if (this.playlistId === null || !this.categoryId) return;

    this.category.set(await this.moviesService.getMovieCategory(this.playlistId, this.categoryId));
    await this.loadMoreMovies();
  }

  async loadMoreMovies(): Promise<void> {
    if (this.playlistId === null || !this.categoryId || this.isLoading() || !this.hasMoreMovies()) {
      return;
    }

    this.isLoading.set(true);
    const nextMovies = await this.moviesService.getMoviesByCategory(
      this.playlistId,
      this.categoryId,
      this.movies().length,
      this.pageSize,
    );
    this.movies.update((movies) => [...movies, ...nextMovies]);
    this.hasMoreMovies.set(nextMovies.length === this.pageSize);
    this.isLoading.set(false);
    this.queueAnotherLoadIfNeeded();
  }

  private queueAnotherLoadIfNeeded(): void {
    setTimeout(() => {
      if (this.hasMoreMovies() && this.loadTrigger?.isNearViewport()) {
        void this.loadMoreMovies();
      }
    });
  }
}
