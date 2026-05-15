import { Route } from "@angular/router";

export const playlistRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/playlist-list/playlist-list.component").then((m) => m.PlaylistListComponent),
    data: {
      routeName: "playlist",
      title: "Lista de reprodução",
    },
  },
  {
    path: "new",
    loadComponent: () => import("./pages/playlist-form/playlist-form.component").then((m) => m.PlaylistFormComponent),
    data: {
      routeName: "add-playlist",
      title: "Adicionar lista",
    },
  },
  {
    path: "edit/:id",
    loadComponent: () => import("./pages/playlist-form/playlist-form.component").then((m) => m.PlaylistFormComponent),
    data: {
      routeName: "edit-playlist",
      title: "Editar lista",
    },
  },
];
