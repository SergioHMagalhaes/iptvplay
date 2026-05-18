import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  input,
  output,
  ViewChild,
} from "@angular/core";
import { PosterCardComponent } from "../poster-card/poster-card.component";

export interface PosterCarouselItem {
  id?: number;
  externalId: number | string;
  name: string;
  imageUrl?: string;
}

type SwiperInstance = {
  isEnd?: boolean;
  progress?: number;
  update: () => void;
};

type SwiperContainerElement = HTMLElement & {
  swiper?: SwiperInstance;
};

@Component({
  selector: "app-poster-carousel",
  standalone: true,
  imports: [PosterCardComponent],
  templateUrl: "./poster-carousel.component.html",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosterCarouselComponent implements AfterViewInit {
  readonly items = input.required<PosterCarouselItem[]>();
  readonly loadMore = output<void>();

  @ViewChild("swiperContainer") private swiperContainer?: ElementRef<SwiperContainerElement>;

  ngAfterViewInit(): void {
    this.refreshSwiper();
  }

  onReachEnd(): void {
    this.loadMore.emit();
  }

  onSlideChange(event: Event): void {
    const swiper = (event as CustomEvent).detail?.[0] as { isEnd?: boolean; progress?: number } | undefined;
    if (swiper?.isEnd || (swiper?.progress ?? 0) >= 0.2) {
      this.loadMore.emit();
    }
  }

  onSlidesUpdated(): void {
    this.refreshSwiper();
  }

  private refreshSwiper(): void {
    queueMicrotask(() => {
      const swiper = this.swiperContainer?.nativeElement.swiper;
      swiper?.update();
      if (swiper?.isEnd || (swiper?.progress ?? 0) >= 0.95) {
        this.loadMore.emit();
      }
    });
  }
}
