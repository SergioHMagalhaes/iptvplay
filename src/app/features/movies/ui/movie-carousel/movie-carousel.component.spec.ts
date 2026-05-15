import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import { MovieCarouselComponent } from "./movie-carousel.component";

describe("MovieCarouselComponent", () => {
  it("requests more movies when Swiper reports the last slide during slide change", () => {
    const fixture = TestBed.createComponent(MovieCarouselComponent);
    fixture.componentRef.setInput("movies", []);
    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.loadMore, "emit");

    component.onSlideChange({ detail: [{ isEnd: true, progress: 1 }] } as unknown as CustomEvent);

    expect(emitSpy).toHaveBeenCalled();
  });

  it("does not request more movies before the carousel is near the end", () => {
    const fixture = TestBed.createComponent(MovieCarouselComponent);
    fixture.componentRef.setInput("movies", []);
    const component = fixture.componentInstance;
    const emitSpy = vi.spyOn(component.loadMore, "emit");

    component.onSlideChange({ detail: [{ isEnd: false, progress: 0.1 }] } as unknown as CustomEvent);

    expect(emitSpy).not.toHaveBeenCalled();
  });
});
