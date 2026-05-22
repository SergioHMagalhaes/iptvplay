import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Route, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { vi } from "vitest";
import { appRoutes } from "../../app.routes";
import { SelectedPlaylistService } from "../services/selected-playlist.service";
import { activePlaylistGuard } from "./active-playlist.guard";

@Component({
  template: "",
})
class RouteStubComponent {}

describe("activePlaylistGuard", () => {
  const configureRouter = async (selectedPlaylistId: number | null, loadMovies: ReturnType<typeof vi.fn>) => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: SelectedPlaylistService,
          useValue: { getSelectedPlaylistId: vi.fn().mockResolvedValue(selectedPlaylistId) },
        },
        provideRouter([
          { path: "", component: RouteStubComponent },
          { path: "playlists", component: RouteStubComponent },
          {
            path: "movies",
            canMatch: [activePlaylistGuard],
            loadChildren: loadMovies as Route["loadChildren"],
          },
        ]),
      ],
    }).compileComponents();

    return RouterTestingHarness.create();
  };

  it("redirects to playlists before a protected lazy route loads without a selection", async () => {
    const loadMovies = vi.fn().mockResolvedValue([{ path: "", component: RouteStubComponent } satisfies Route]);
    const harness = await configureRouter(null, loadMovies);

    await harness.navigateByUrl("/movies");

    expect(TestBed.inject(Router).url).toBe("/playlists");
    expect(loadMovies).not.toHaveBeenCalled();
  });

  it("loads a protected lazy route when a playlist is selected", async () => {
    const loadMovies = vi.fn().mockResolvedValue([{ path: "", component: RouteStubComponent } satisfies Route]);
    const harness = await configureRouter(18, loadMovies);

    await harness.navigateByUrl("/movies");

    expect(TestBed.inject(Router).url).toBe("/movies");
    expect(loadMovies).toHaveBeenCalledOnce();
  });

  it("guards every app route that requires an active playlist", () => {
    for (const path of ["movies", "tv", "series", "search"]) {
      expect(appRoutes.find((route) => route.path === path)?.canMatch).toContain(activePlaylistGuard);
    }

    expect(appRoutes.find((route) => route.path === "playlists")?.canMatch).toBeUndefined();
  });
});
