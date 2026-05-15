import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { LUCIDE_ICONS } from "../../icons/lucide-icons";
import { RouteTitleService } from "../../services/route-title.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [LUCIDE_ICONS],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly routeTitleService = inject(RouteTitleService);

  readonly title = this.routeTitleService.title;

  openPlaylists(): Promise<boolean> {
    return this.router.navigate(["/playlists"]);
  }
}
