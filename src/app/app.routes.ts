import { Route } from "@angular/router";

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
    loadChildren: () => import("./features/movies/movies.routes").then((m) => m.moviesRoutes),
  },
  {
    path: "tv",
    loadChildren: () => import("./features/tv/tv.routes").then((m) => m.liveTvRoutes),
  },
  {
    path: "series",
    loadChildren: () => import("./features/series/series.routes").then((m) => m.seriesRoutes),
  },
  {
    path: "search",
    loadChildren: () => import("./features/search/search.routes").then((m) => m.searchRoutes),
  },
];
