import { Component, inject } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NavbarComponent } from "./core/layout/navbar/navbar.component";
import { Router, NavigationEnd } from "@angular/router";
import { filter, map, startWith } from "rxjs/operators";
import { toSignal } from "@angular/core/rxjs-interop";
import { AppNavigationComponent } from "./core/layout/app-navigation/app-navigation.component";

@Component({
  imports: [RouterModule, NavbarComponent, AppNavigationComponent],
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {
  protected title = "iptvplay";
  private router = inject(Router);
  readonly isPlaylistRoute = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url === "/playlists"),
      startWith(this.router.url === "/playlists"),
    ),
    { initialValue: false },
  );
}
