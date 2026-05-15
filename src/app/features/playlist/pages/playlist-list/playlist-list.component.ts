import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { PlaylistService } from "../../../../core/services/playlist.service";
import { PlaylistEntry } from "../../../../core/models/playlist.model";
import { LUCIDE_ICONS } from "../../../../shared/icons/lucide-icons";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { PlaylistSyncService } from "../../../../core/services/playlist-sync.service";

@Component({
  selector: "app-playlist-list",
  standalone: true,
  imports: [CommonModule, LUCIDE_ICONS],
  templateUrl: "./playlist-list.component.html",
  styleUrl: "./playlist-list.component.scss",
})
export class PlaylistListComponent implements OnInit {
  private playlistService = inject(PlaylistService);
  private selectedPlaylistService = inject(SelectedPlaylistService);
  private playlistSyncService = inject(PlaylistSyncService);
  private router = inject(Router);

  playlists = signal<PlaylistEntry[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  syncErrorMessage = signal<string | null>(null);
  openMenuId = signal<number | null>(null);
  selectedPlaylistId = signal<number | null>(null);
  syncingPlaylistId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadPlaylists();
    this.restoreSelectedPlaylist();
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

  async selectForPlayer(playlist: PlaylistEntry): Promise<void> {
    if (playlist.id === undefined) return;

    this.syncErrorMessage.set(null);
    this.syncingPlaylistId.set(playlist.id);
    try {
      await this.selectedPlaylistService.selectPlaylist(playlist.id);
      this.selectedPlaylistId.set(playlist.id);
      if (playlist.sourceType === "xtream") {
        await this.playlistSyncService.syncPlaylist(playlist);
      }
    } catch (err) {
      this.syncErrorMessage.set(err instanceof Error ? err.message : "Não foi possível sincronizar a playlist.");
    } finally {
      this.syncingPlaylistId.set(null);
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

  private restoreSelectedPlaylist(): void {
    this.selectedPlaylistService
      .getSelectedPlaylistId()
      .then((playlistId) => this.selectedPlaylistId.set(playlistId))
      .catch((err: Error) => this.syncErrorMessage.set(err.message));
  }
}
