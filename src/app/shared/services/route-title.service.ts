import { Injectable, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRouteSnapshot, NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";

@Injectable({ providedIn: "root" })
export class RouteTitleService {
  private readonly router = inject(Router);
  readonly title = signal("");

  constructor() {
    this.updateTitle();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updateTitle());
  }

  private updateTitle(): void {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let title = "";

    while (route) {
      if (typeof route.data["title"] === "string") {
        title = route.data["title"];
      }

      route = route.firstChild;
    }

    this.title.set(title);
  }
}
