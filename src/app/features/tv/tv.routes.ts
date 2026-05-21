import { Route } from "@angular/router";

export const liveTvRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/tv-home/tv-home.component").then((m) => m.TvHomeComponent),
    data: {
      routeName: "tv-home",
      title: "Ao vivo",
    },
  },
  {
    path: "category/:categoryId",
    loadComponent: () => import("./pages/tv-category/tv-category.component").then((m) => m.TvCategoryComponent),
    data: {
      routeName: "tv-category",
      title: "Ao vivo",
    },
  },
];
