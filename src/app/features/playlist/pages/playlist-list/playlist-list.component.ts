import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { PlaylistService } from "../../../../core/services/playlist.service";
import { PlaylistEntry } from "../../../../core/models/playlist.model";

@Component({
  selector: "app-playlist-list",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./playlist-list.component.html",
  styleUrl: "./playlist-list.component.scss",
})
export class PlaylistListComponent implements OnInit {
  private playlistService = inject(PlaylistService);
  private router = inject(Router);

  playlists = signal<PlaylistEntry[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  openMenuId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPlaylists();
  }

  loadPlaylists(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.playlistService
      .getAllPlaylists()
      .then((playlists) => {
        this.playlists.set(playlists);
        this.isLoading.set(false);
      })
      .catch((err: Error) => {
        this.errorMessage.set(err.message);
        this.isLoading.set(false);
      });
  }

  navigateToAdd(): void {
    this.router.navigate(["/playlists", "new"]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(["/playlists", "edit", id]);
  }

  deletePlaylist(id: number): void {
    this.playlistService.deletePlaylist(id).then(() => this.loadPlaylists());
  }

  confirmDelete(id: number): void {
    this.playlistService.deletePlaylist(id).then(() => this.loadPlaylists());
  }

  toggleMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  onCardClick(playlist: PlaylistEntry): void {
    if (playlist.id !== undefined) {
      this.navigateToEdit(playlist.id);
    }
  }

  exit(): void {
    this.router.navigate(["/"]);
  }

  getExpiryText(expiresAt: string): string {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expirado";
    return `Expira em ${diffDays} dias`;
  }
}
