import { ComponentFixture, TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import { PosterCarouselComponent } from "./poster-carousel.component";

describe("PosterCarouselComponent", () => {
  let fixture: ComponentFixture<PosterCarouselComponent>;
  let component: PosterCarouselComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PosterCarouselComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PosterCarouselComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("items", []);
  });

  it("requests more items when Swiper reports the last slide during slide change", () => {
    const loadMoreSpy = vi.fn();
    component.loadMore.subscribe(loadMoreSpy);

    component.onSlideChange(new CustomEvent("swiperslidechange", { detail: [{ isEnd: true }] }));

    expect(loadMoreSpy).toHaveBeenCalled();
  });

  it("does not request more items before the carousel is near the end", () => {
    const loadMoreSpy = vi.fn();
    component.loadMore.subscribe(loadMoreSpy);

    component.onSlideChange(new CustomEvent("swiperslidechange", { detail: [{ progress: 0.1 }] }));

    expect(loadMoreSpy).not.toHaveBeenCalled();
  });

  it("emits the selected poster when an item is clicked", () => {
    const selectedSpy = vi.fn();
    const item = { externalId: 42, name: "Movie 42" };
    fixture.componentRef.setInput("items", [item]);
    component.selected.subscribe(selectedSpy);
    fixture.detectChanges();

    fixture.nativeElement.querySelector("swiper-slide").click();

    expect(selectedSpy).toHaveBeenCalledWith(item);
  });
});
