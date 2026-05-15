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
import { IptvMovie } from "../../../../core/models/iptv-content.model";
import { MovieCardComponent } from "../movie-card/movie-card.component";

type SwiperInstance = {
  isEnd?: boolean;
  progress?: number;
  update: () => void;
};

type SwiperContainerElement = HTMLElement & {
  swiper?: SwiperInstance;
};

@Component({
  selector: "app-movie-carousel",
  standalone: true,
  imports: [MovieCardComponent],
  templateUrl: "./movie-carousel.component.html",
  styleUrl: "./movie-carousel.component.scss",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCarouselComponent implements AfterViewInit {
  readonly movies = input.required<IptvMovie[]>();
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
