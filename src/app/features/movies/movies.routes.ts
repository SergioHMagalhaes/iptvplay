import { Route } from "@angular/router";

export const moviesRoutes: Route[] = [
  {
    path: "",
    loadComponent: () => import("./pages/movies-home/movies-home.component").then((m) => m.MoviesHomeComponent),
    data: {
      routeName: "movies-home",
      title: "Filmes",
    },
  },
  {
    path: "category/:categoryId",
    loadComponent: () =>
      import("./pages/movie-category/movie-category.component").then((m) => m.MovieCategoryComponent),
    data: {
      routeName: "movies-category",
      title: "Filmes",
    },
  },
  {
    path: ":kind/:externalId",
    loadComponent: () =>
      import("../details/pages/content-details/content-details.component").then((m) => m.ContentDetailsComponent),
    data: {
      routeName: "movie-details",
      title: "Filmes",
    },
  },
];
