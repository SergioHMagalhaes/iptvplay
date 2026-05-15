import { Route } from "@angular/router";

export const appRoutes: Route[] = [
  {
    path: "",
    redirectTo: "playlists",
    pathMatch: "full",
  },
  {
    path: "playlists",
    loadChildren: () => import("./features/playlist/playlist.routes").then((m) => m.playlistRoutes),
  },
];
