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
];
