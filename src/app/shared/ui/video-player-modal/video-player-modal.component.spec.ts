import { ComponentFixture, TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import { VideoPlayerService } from "../../services/video-player.service";
import { VideoPlayerModalComponent } from "./video-player-modal.component";

describe("VideoPlayerModalComponent", () => {
  let fixture: ComponentFixture<VideoPlayerModalComponent>;
  let component: VideoPlayerModalComponent;
  let videoPlayer: {
    play: ReturnType<typeof vi.fn>;
    dispose: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    videoPlayer = {
      play: vi.fn().mockResolvedValue(undefined),
      dispose: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VideoPlayerModalComponent],
      providers: [{ provide: VideoPlayerService, useValue: videoPlayer }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPlayerModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("src", "https://iptv.test/live/u/p/7.m3u8");
    fixture.componentRef.setInput("title", "Channel 7");
    fixture.componentRef.setInput("mode", "live");
  });

  it("starts a live Video.js player against the modal video element", async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    const [mediaElement, src, options] = videoPlayer.play.mock.calls[0];
    expect(mediaElement.tagName.toLowerCase()).toBe("video");
    expect(mediaElement.isConnected).toBe(true);
    expect(src).toBe("https://iptv.test/live/u/p/7.m3u8");
    expect(options).toEqual({ mode: "live" });
  });

  it("disposes the player when the modal closes", () => {
    const closeSpy = vi.fn();
    component.closed.subscribe(closeSpy);

    component.close();

    expect(videoPlayer.dispose).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});
