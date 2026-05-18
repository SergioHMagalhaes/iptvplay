export type AppNavigationId = "search" | "tv" | "movies" | "series" | "playlists";

export interface AppNavigationItem {
  readonly id: AppNavigationId;
  readonly label: string;
  readonly route: string | null;
  readonly desktopOrder: number | null;
  readonly mobileOrder: number | null;
}

export const APP_NAVIGATION_ITEMS: readonly AppNavigationItem[] = [
  {
    id: "search",
    label: "Buscar",
    route: null,
    desktopOrder: 1,
    mobileOrder: 4,
  },
  {
    id: "tv",
    label: "Ao vivo",
    route: null,
    desktopOrder: 2,
    mobileOrder: 1,
  },
  {
    id: "movies",
    label: "Filmes",
    route: "/movies",
    desktopOrder: 3,
    mobileOrder: 2,
  },
  {
    id: "series",
    label: "Séries",
    route: "/series",
    desktopOrder: 4,
    mobileOrder: 3,
  },
  {
    id: "playlists",
    label: "Listas",
    route: "/playlists",
    desktopOrder: 5,
    mobileOrder: null,
  },
] as const;
