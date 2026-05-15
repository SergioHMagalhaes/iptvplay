import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouteTitleService } from "./route-title.service";

describe("RouteTitleService", () => {
  let router: Router;
  let service: RouteTitleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: "movies",
            children: [
              {
                path: "",
                component: EmptyComponent,
                data: { title: "Filmes" },
              },
            ],
          },
        ]),
      ],
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(RouteTitleService);
  });

  it("resolves the deepest active route title", async () => {
    await router.navigateByUrl("/movies");

    expect(service.title()).toBe("Filmes");
  });
});

class EmptyComponent {}
