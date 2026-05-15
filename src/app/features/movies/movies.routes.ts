import { Route } from "@angular/router";

export const moviesRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/movies-home/movies-home.component").then((m) => m.MoviesHomeComponent),
  },
  {
    path: "category/:categoryId",
    loadComponent: () =>
      import("./pages/movie-category/movie-category.component").then((m) => m.MovieCategoryComponent),
  },
];
