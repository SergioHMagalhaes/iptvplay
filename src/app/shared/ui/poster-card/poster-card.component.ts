import { ChangeDetectionStrategy, Component, input, signal } from "@angular/core";
import { LazyLoadTriggerDirective } from "../../directives/lazy-load-trigger.directive";

@Component({
  selector: "app-poster-card",
  standalone: true,
  imports: [LazyLoadTriggerDirective],
  templateUrl: "./poster-card.component.html",
  styleUrl: "./poster-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PosterCardComponent {
  readonly tv = input<boolean>(false);
  readonly name = input.required<string>();
  readonly imageUrl = input<string | undefined>();
  readonly shouldLoadImage = signal(false);
  readonly hasImageError = signal(false);

  requestImage(): void {
    if (this.imageUrl()) {
      this.shouldLoadImage.set(true);
    }
  }

  markImageAsFailed(): void {
    this.hasImageError.set(true);
  }
}
