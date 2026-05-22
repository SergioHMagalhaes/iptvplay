import { Route } from "@angular/router";
import { activePlaylistGuard } from "./core/guards/active-playlist.guard";

export const appRoutes: Route[] = [
  {
    path: "",
    redirectTo: "movies",
    pathMatch: "full",
  },
  {
    path: "playlists",
    loadChildren: () => import("./features/playlist/playlist.routes").then((m) => m.playlistRoutes),
  },
  {
    path: "movies",
    canMatch: [activePlaylistGuard],
    loadChildren: () => import("./features/movies/movies.routes").then((m) => m.moviesRoutes),
  },
  {
    path: "tv",
    canMatch: [activePlaylistGuard],
    loadChildren: () => import("./features/tv/tv.routes").then((m) => m.liveTvRoutes),
  },
  {
    path: "series",
    canMatch: [activePlaylistGuard],
    loadChildren: () => import("./features/series/series.routes").then((m) => m.seriesRoutes),
  },
  {
    path: "search",
    canMatch: [activePlaylistGuard],
    loadChildren: () => import("./features/search/search.routes").then((m) => m.searchRoutes),
  },
];
