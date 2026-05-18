import { Route } from "@angular/router";

export const seriesRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/series-home/series-home.component").then((m) => m.SeriesHomeComponent),
    data: {
      routeName: "series-home",
      title: "Séries",
    },
  },
  {
    path: "category/:categoryId",
    loadComponent: () =>
      import("./pages/series-category/series-category.component").then((m) => m.SeriesCategoryComponent),
    data: {
      routeName: "series-category",
      title: "Séries",
    },
  },
];
