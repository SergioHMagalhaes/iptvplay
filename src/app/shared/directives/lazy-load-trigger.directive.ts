import { AfterViewInit, Directive, ElementRef, inject, OnDestroy, output } from "@angular/core";

@Directive({
  selector: "[appLazyLoadTrigger]",
  standalone: true,
})
export class LazyLoadTriggerDirective implements AfterViewInit, OnDestroy {
  private elementRef = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  readonly reached = output<void>();

  ngAfterViewInit(): void {
    if (!("IntersectionObserver" in globalThis)) {
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.reached.emit();
        }
      },
      { rootMargin: "240px 0px" },
    );
    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  isNearViewport(): boolean {
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    return rect.top <= window.innerHeight + 240;
  }
}
