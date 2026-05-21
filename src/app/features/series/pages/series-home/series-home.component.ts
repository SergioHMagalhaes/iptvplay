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
import { SeriesService } from "../../data-access/services/series.service";

@Component({
  selector: "app-series-home",
  standalone: true,
  imports: [CommonModule, PosterCarouselComponent, LazyLoadTriggerDirective],
  templateUrl: "./series-home.component.html",
  styleUrl: "./series-home.component.scss",
})
export class SeriesHomeComponent implements OnInit {
  private seriesService = inject(SeriesService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private router = inject(Router);
  private playlistId: number | null = null;
  private readonly loader = new CategorySectionsLoader<PosterCarouselItem>({
    categoryPageSize: 8,
    itemPageSize: 12,
    errorMessage: "Não foi possível carregar as séries.",
    getCategories: (playlistId, offset, limit) => this.seriesService.getSeriesCategories(playlistId, offset, limit),
    getItemsByCategory: async (playlistId, categoryId, offset, limit) => {
      const series = await this.seriesService.getSeriesByCategory(playlistId, categoryId, offset, limit);
      return series.map((item) => ({
        id: item.id,
        externalId: item.externalId,
        name: item.name,
        imageUrl: item.cover,
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

  async loadMoreSeries(categoryId: string): Promise<void> {
    await this.loader.loadMoreItems(this.playlistId, categoryId);
  }

  openCategory(categoryId: string): Promise<boolean> {
    return this.router.navigate(["/series/category", categoryId]);
  }

  openSeries(series: PosterCarouselItem): Promise<boolean> {
    return this.router.navigate(["/series/series", series.externalId]);
  }
}
