import { CommonModule } from "@angular/common";
import { Component, inject, OnInit, signal } from "@angular/core";
import { Router } from "@angular/router";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { CategorySectionsLoader } from "../../../../shared/data-access/content-pagination";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";
import {
  PosterCarouselComponent,
  PosterCarouselItem,
} from "../../../../shared/ui/poster-carousel/poster-carousel.component";
import { VideoPlayerModalComponent } from "../../../../shared/ui/video-player-modal/video-player-modal.component";
import { LiveTvService } from "../../data-access/services/tv.service";
import { toChannelPosterItem } from "../../ui/channel-poster-item";

@Component({
  selector: "app-tv-home",
  standalone: true,
  imports: [CommonModule, PosterCarouselComponent, LazyLoadTriggerDirective, VideoPlayerModalComponent],
  templateUrl: "./tv-home.component.html",
})
export class TvHomeComponent implements OnInit {
  private readonly liveTvService = inject(LiveTvService);
  private readonly selectedPlaylistService = inject(SelectedPlaylistService);
  private readonly router = inject(Router);
  private playlistId: number | null = null;
  private readonly loader = new CategorySectionsLoader<PosterCarouselItem>({
    categoryPageSize: 8,
    itemPageSize: 12,
    errorMessage: "Não foi possível carregar os canais.",
    getCategories: (playlistId, offset, limit) => this.liveTvService.getChannelCategories(playlistId, offset, limit),
    getItemsByCategory: async (playlistId, categoryId, offset, limit) => {
      const channels = await this.liveTvService.getChannelsByCategory(playlistId, categoryId, offset, limit);
      return channels.map(toChannelPosterItem);
    },
  });

  readonly sections = this.loader.sections;
  readonly isLoading = this.loader.isLoading;
  readonly hasMoreCategories = this.loader.hasMoreCategories;
  readonly errorMessage = this.loader.errorMessage;
  readonly playbackUrl = signal<string | null>(null);
  readonly channelTitle = signal("");

  async ngOnInit(): Promise<void> {
    this.playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    await this.loadMoreCategories();
  }

  async loadMoreCategories(): Promise<void> {
    await this.loader.loadMoreCategories(this.playlistId);
  }

  async loadMoreChannels(categoryId: string): Promise<void> {
    await this.loader.loadMoreItems(this.playlistId, categoryId);
  }

  openCategory(categoryId: string): Promise<boolean> {
    return this.router.navigate(["/tv/category", categoryId]);
  }

  async openChannel(channel: PosterCarouselItem): Promise<void> {
    this.channelTitle.set(channel.name);
    this.playbackUrl.set(await this.liveTvService.getChannelPlaybackUrl(Number(channel.externalId)));
  }

  closePlayer(): void {
    this.playbackUrl.set(null);
  }
}
