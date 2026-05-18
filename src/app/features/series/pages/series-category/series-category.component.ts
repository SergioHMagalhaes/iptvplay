import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import { CategoryPageLoader } from "../../../../shared/data-access/content-pagination";
import { PosterCardComponent } from "../../../../shared/ui/poster-card/poster-card.component";
import { PosterCarouselItem } from "../../../../shared/ui/poster-carousel/poster-carousel.component";
import { SeriesService } from "../../data-access/services/series.service";

@Component({
  selector: "app-series-category",
  standalone: true,
  imports: [CommonModule, PosterCardComponent, LazyLoadTriggerDirective],
  templateUrl: "./series-category.component.html",
  styleUrl: "./series-category.component.scss",
})
export class SeriesCategoryComponent implements OnInit {
  private seriesService = inject(SeriesService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private route = inject(ActivatedRoute);
  private playlistId: number | null = null;
  private categoryId = "";
  private readonly loader = new CategoryPageLoader<PosterCarouselItem>({
    pageSize: 24,
    getCategory: (playlistId, categoryId) => this.seriesService.getSeriesCategory(playlistId, categoryId),
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

  readonly category = this.loader.category;
  readonly series = this.loader.items;
  readonly hasMoreSeries = this.loader.hasMoreItems;
  readonly isLoading = this.loader.isLoading;

  @ViewChild(LazyLoadTriggerDirective) private loadTrigger?: LazyLoadTriggerDirective;

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    this.categoryId = this.route.snapshot.paramMap.get("categoryId") ?? "";
    await this.loader.init(this.playlistId, this.categoryId);
  }

  async loadMoreSeries(): Promise<void> {
    await this.loader.loadMore(this.playlistId, this.categoryId);
    this.loader.queueAnotherLoadIfNeeded(this.playlistId, this.categoryId, () => this.loadTrigger?.isNearViewport());
  }
}
