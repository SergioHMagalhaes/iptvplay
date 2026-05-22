import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { vi } from "vitest";
import { NavbarComponent } from "./navbar.component";

describe("NavbarComponent", () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([
          {
            path: "movies",
            component: EmptyComponent,
            data: { title: "Filmes" },
          },
          {
            path: "playlists",
            component: EmptyComponent,
            data: { title: "Lista de reprodução" },
          },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    router = TestBed.inject(Router);
  });

  it("renders the application logo", () => {
    fixture.detectChanges();

    const logo = (fixture.nativeElement as HTMLElement).querySelector("img");

    expect(logo?.getAttribute("src")).toBe("/assets/logos/iptvplay-logo.svg");
    expect(logo?.getAttribute("alt")).toBe("iptvplay");
  });

  it("renders the current route title", async () => {
    await router.navigateByUrl("/movies");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("h1")?.textContent).toContain("Filmes");
  });

  it("navigates to the playlist list when the settings button is clicked", async () => {
    await router.navigateByUrl("/movies");
    fixture.detectChanges();

    const navigateSpy = vi.spyOn(router, "navigate");
    const settingsButton = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button[aria-label="Abrir listas"]',
    );

    settingsButton?.click();

    expect(navigateSpy).toHaveBeenCalledWith(["/playlists"]);
  });
});

class EmptyComponent {}
