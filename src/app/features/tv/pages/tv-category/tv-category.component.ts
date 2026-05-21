import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { CategoryPageLoader } from "../../../../shared/data-access/content-pagination";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import { PosterCardComponent } from "../../../../shared/ui/poster-card/poster-card.component";
import { PosterCarouselItem } from "../../../../shared/ui/poster-carousel/poster-carousel.component";
import { VideoPlayerModalComponent } from "../../../../shared/ui/video-player-modal/video-player-modal.component";
import { LiveTvService } from "../../data-access/services/tv.service";
import { toChannelPosterItem } from "../../ui/channel-poster-item";

@Component({
  selector: "app-tv-category",
  standalone: true,
  imports: [CommonModule, PosterCardComponent, LazyLoadTriggerDirective, VideoPlayerModalComponent],
  templateUrl: "./tv-category.component.html",
})
export class TvCategoryComponent implements OnInit {
  private readonly liveTvService = inject(LiveTvService);
  private readonly selectedPlaylistService = inject(SelectedPlaylistService);
  private readonly route = inject(ActivatedRoute);
  private playlistId: number | null = null;
  private categoryId = "";
  private readonly loader = new CategoryPageLoader<PosterCarouselItem>({
    pageSize: 24,
    getCategory: (playlistId, categoryId) => this.liveTvService.getChannelCategory(playlistId, categoryId),
    getItemsByCategory: async (playlistId, categoryId, offset, limit) => {
      const channels = await this.liveTvService.getChannelsByCategory(playlistId, categoryId, offset, limit);
      return channels.map(toChannelPosterItem);
    },
  });

  readonly category = this.loader.category;
  readonly channels = this.loader.items;
  readonly hasMoreChannels = this.loader.hasMoreItems;
  readonly isLoading = this.loader.isLoading;
  readonly playbackUrl = signal<string | null>(null);
  readonly channelTitle = signal("");

  @ViewChild(LazyLoadTriggerDirective) private loadTrigger?: LazyLoadTriggerDirective;

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    this.categoryId = this.route.snapshot.paramMap.get("categoryId") ?? "";
    await this.loader.init(this.playlistId, this.categoryId);
  }

  async loadMoreChannels(): Promise<void> {
    await this.loader.loadMore(this.playlistId, this.categoryId);
    this.loader.queueAnotherLoadIfNeeded(this.playlistId, this.categoryId, () => this.loadTrigger?.isNearViewport());
  }

  async openChannel(channel: PosterCarouselItem): Promise<void> {
    this.channelTitle.set(channel.name);
    this.playbackUrl.set(await this.liveTvService.getChannelPlaybackUrl(Number(channel.externalId)));
  }

  closePlayer(): void {
    this.playbackUrl.set(null);
  }
}
