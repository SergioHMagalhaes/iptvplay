import { Route } from "@angular/router";

export const appRoutes: Route[] = [
  {
    path: "",
    redirectTo: "playlists",
    pathMatch: "full",
  },
  {
    path: "playlists",
    loadComponent: () =>
      import("./features/playlist/pages/playlist-list/playlist-list.component").then((m) => m.PlaylistListComponent),
  },
  {
    path: "playlists/new",
    loadComponent: () =>
      import("./features/playlist/pages/playlist-form/playlist-form.component").then((m) => m.PlaylistFormComponent),
  },
  {
    path: "playlists/edit/:id",
    loadComponent: () =>
      import("./features/playlist/pages/playlist-form/playlist-form.component").then((m) => m.PlaylistFormComponent),
  },
];
