import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
import { IptvMovie } from "../../../../core/models/iptv-content.model";
import { LazyLoadTriggerDirective } from "../../../../shared/directives/lazy-load-trigger.directive";

@Component({
  selector: "app-movie-card",
  standalone: true,
  imports: [LazyLoadTriggerDirective],
  templateUrl: "./movie-card.component.html",
  styleUrl: "./movie-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  readonly movie = input.required<IptvMovie>();
  readonly shouldLoadImage = signal(false);
  readonly hasImageError = signal(false);

  requestImage(): void {
    if (this.movie().streamIcon) {
      this.shouldLoadImage.set(true);
    }
  }

  markImageAsFailed(): void {
    this.hasImageError.set(true);
  }
}
