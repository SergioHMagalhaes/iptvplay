import { Route } from "@angular/router";

export const searchRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/search/search.component").then((m) => m.SearchComponent),
    data: {
      routeName: "search",
      title: "Buscar",
    },
  },
];
