import { TestBed } from "@angular/core/testing";
import { MovieCardComponent } from "./movie-card.component";

describe("MovieCardComponent", () => {
  it("defers poster creation until the card reaches the viewport", () => {
    const fixture = TestBed.createComponent(MovieCardComponent);
    fixture.componentRef.setInput("movie", {
      playlistId: 1,
      externalId: 1,
      categoryId: "10",
      name: "Action Movie",
      streamIcon: "https://example.com/poster.jpg",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("img")).toBeNull();

    fixture.componentInstance.requestImage();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("img")).toBeTruthy();
  });

  it("shows the fallback only after an image failure", () => {
    const fixture = TestBed.createComponent(MovieCardComponent);
    fixture.componentRef.setInput("movie", {
      playlistId: 1,
      externalId: 1,
      categoryId: "10",
      name: "Action Movie",
      streamIcon: "https://example.com/poster.jpg",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
    fixture.componentInstance.requestImage();
    fixture.detectChanges();

    fixture.componentInstance.markImageAsFailed();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".poster-fallback")).toBeTruthy();
  });
});
