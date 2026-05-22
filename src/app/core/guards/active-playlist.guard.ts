import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { SelectedPlaylistService } from "../services/selected-playlist.service";

export const activePlaylistGuard: CanMatchFn = async () => {
  const selectedPlaylistService = inject(SelectedPlaylistService);
  const router = inject(Router);
  const selectedPlaylistId = await selectedPlaylistService.getSelectedPlaylistId();

  return selectedPlaylistId !== null ? true : router.createUrlTree(["/playlists"]);
};
