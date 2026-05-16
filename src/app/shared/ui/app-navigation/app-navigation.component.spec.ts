import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { AppNavigationComponent } from "./app-navigation.component";

describe("AppNavigationComponent", () => {
  let fixture: ComponentFixture<AppNavigationComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppNavigationComponent],
      providers: [
        provideRouter([
          { path: "movies", component: EmptyComponent },
          { path: "playlists", component: EmptyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppNavigationComponent);
    router = TestBed.inject(Router);
  });

  it("renders a desktop sidebar and a mobile bottom bar with responsive visibility classes", () => {
    fixture.detectChanges();

    const sidebar = fixture.nativeElement.querySelector('[data-testid="desktop-sidebar"]');
    const bottomBar = fixture.nativeElement.querySelector('[data-testid="mobile-bottom-bar"]');

    expect(sidebar).toBeTruthy();
    expect(sidebar.className).toContain("hidden");
    expect(sidebar.className).toContain("md:flex");
    expect(bottomBar).toBeTruthy();
    expect(bottomBar.className).toContain("flex");
    expect(bottomBar.className).toContain("md:hidden");
  });

  it("highlights the active route automatically after navigation", async () => {
    await router.navigateByUrl("/movies");
    fixture.detectChanges();

    const movieLinks = fixture.nativeElement.querySelectorAll('[data-nav-id="movies"]');

    expect(movieLinks.length).toBe(2);
    movieLinks.forEach((link: HTMLAnchorElement) => {
      expect(link.className).toContain("text-primary");
      expect(link.getAttribute("aria-current")).toBe("page");
    });
  });

  it("navigates the clapperboard item to movies", () => {
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, "navigateByUrl");
    const host = fixture.nativeElement as HTMLElement;
    const moviesLink = host.querySelector<HTMLAnchorElement>('[data-testid="desktop-sidebar"] [data-nav-id="movies"]');

    moviesLink?.click();

    expect(navigateSpy).toHaveBeenCalledWith("/movies");
  });

  it("navigates the settings item to playlists", () => {
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, "navigateByUrl");
    const host = fixture.nativeElement as HTMLElement;
    const playlistsLink = host.querySelector<HTMLAnchorElement>(
      '[data-testid="desktop-sidebar"] [data-nav-id="playlists"]',
    );

    playlistsLink?.click();

    expect(navigateSpy).toHaveBeenCalledWith("/playlists");
  });

  it("renders all design navigation icons, including items for routes not implemented yet", () => {
    fixture.detectChanges();

    const desktopIds = [...fixture.nativeElement.querySelectorAll('[data-testid="desktop-sidebar"] [data-nav-id]')].map(
      (item: Element) => item.getAttribute("data-nav-id"),
    );
    const mobileIds = [
      ...fixture.nativeElement.querySelectorAll('[data-testid="mobile-bottom-bar"] [data-nav-id]'),
    ].map((item: Element) => item.getAttribute("data-nav-id"));

    expect(desktopIds).toEqual(["search", "tv", "movies", "live", "playlists"]);
    expect(mobileIds).toEqual(["tv", "movies", "live", "search"]);
  });
});

@Component({
  template: "",
})
class EmptyComponent {}
