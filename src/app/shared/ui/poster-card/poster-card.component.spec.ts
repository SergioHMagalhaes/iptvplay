import { TestBed } from "@angular/core/testing";
import { PosterCardComponent } from "./poster-card.component";

describe("PosterCardComponent", () => {
  it("defers poster creation until the card reaches the viewport", () => {
    const fixture = TestBed.createComponent(PosterCardComponent);
    fixture.componentRef.setInput("name", "Action Movie");
    fixture.componentRef.setInput("imageUrl", "https://example.com/poster.jpg");
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("img")).toBeNull();

    fixture.componentInstance.requestImage();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector("img")).toBeTruthy();
  });

  it("shows the fallback only after an image failure", () => {
    const fixture = TestBed.createComponent(PosterCardComponent);
    fixture.componentRef.setInput("name", "Action Movie");
    fixture.componentRef.setInput("imageUrl", "https://example.com/poster.jpg");
    fixture.componentInstance.requestImage();
    fixture.detectChanges();

    fixture.componentInstance.markImageAsFailed();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".poster-fallback")).toBeTruthy();
  });
});
