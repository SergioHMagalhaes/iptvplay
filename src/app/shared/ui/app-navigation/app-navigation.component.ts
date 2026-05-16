import { Component, computed, inject } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { filter, map, startWith } from "rxjs";
import { APP_NAVIGATION_ITEMS, AppNavigationItem } from "../../../core/navigation/app-navigation.model";
import { LUCIDE_ICONS } from "../../icons/lucide-icons";

@Component({
  selector: "app-navigation",
  standalone: true,
  imports: [LUCIDE_ICONS],
  templateUrl: "./app-navigation.component.html",
})
export class AppNavigationComponent {
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly desktopItems = this.orderedItems("desktopOrder");
  readonly mobileItems = this.orderedItems("mobileOrder");
  readonly activeRoute = computed(() => this.currentUrl());

  isActive(item: AppNavigationItem): boolean {
    return item.route !== null && this.activeRoute().startsWith(item.route);
  }

  navigate(item: AppNavigationItem): Promise<boolean> | void {
    if (item.route === null) {
      return;
    }

    return this.router.navigateByUrl(item.route);
  }

  private orderedItems(orderKey: "desktopOrder" | "mobileOrder"): AppNavigationItem[] {
    return APP_NAVIGATION_ITEMS.filter((item) => item[orderKey] !== null).sort(
      (first, second) => (first[orderKey] ?? 0) - (second[orderKey] ?? 0),
    );
  }
}
