import { Route } from "@angular/router";

export const playlistRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/playlist-list/playlist-list.component").then((m) => m.PlaylistListComponent),
  },
  {
    path: "new",
    loadComponent: () => import("./pages/playlist-form/playlist-form.component").then((m) => m.PlaylistFormComponent),
  },
  {
    path: "edit/:id",
    loadComponent: () => import("./pages/playlist-form/playlist-form.component").then((m) => m.PlaylistFormComponent),
  },
];
