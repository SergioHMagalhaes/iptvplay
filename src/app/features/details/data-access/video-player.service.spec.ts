import { TestBed } from "@angular/core/testing";
import { VIDEOJS_FACTORY, VideoJsPlayer, VideoPlayerService } from "./video-player.service";

describe("VideoPlayerService", () => {
  let videojs: ReturnType<typeof vi.fn>;
  let player: VideoJsPlayer;
  let service: VideoPlayerService;
  let media: HTMLVideoElement;

  beforeEach(() => {
    player = {
      dispose: vi.fn(),
      isDisposed: vi.fn().mockReturnValue(false),
      play: vi.fn().mockResolvedValue(undefined),
    };
    videojs = vi.fn().mockReturnValue(player);
    TestBed.configureTestingModule({
      providers: [{ provide: VIDEOJS_FACTORY, useValue: videojs }],
    });
    service = TestBed.inject(VideoPlayerService);

    media = document.createElement("video");
  });

  it("does not initialize until the native video element is mounted", async () => {
    await service.play(media, "https://iptv.test/movie.mp4");

    expect(videojs).not.toHaveBeenCalled();
    expect(player.play).not.toHaveBeenCalled();
  });

  it("Automatically starts playback when the Video.js player initializes", async () => {
    document.body.appendChild(media);

    await service.play(media, "https://iptv.test/movie.mp4");

    expect(videojs).toHaveBeenCalledWith(
      media,
      expect.objectContaining({
        autoplay: true,
        controls: true,
        disablePictureInPicture: true,
        fill: true,
        fluid: false,
        playsinline: true,
        controlBar: expect.objectContaining({ pictureInPictureToggle: false }),
        sources: [{ src: "https://iptv.test/movie.mp4", type: "video/mp4" }],
      }),
    );
    expect(media.hasAttribute("disablepictureinpicture")).toBe(true);
    expect(player.play).toHaveBeenCalled();
  });

  it("uses the native Video.js VHS source type for HLS streams", async () => {
    document.body.appendChild(media);

    await service.play(media, "https://iptv.test/live/channel.m3u8?token=abc");

    expect(videojs).toHaveBeenCalledWith(
      media,
      expect.objectContaining({
        html5: expect.objectContaining({ vhs: expect.any(Object) }),
        sources: [{ src: "https://iptv.test/live/channel.m3u8?token=abc", type: "application/x-mpegURL" }],
      }),
    );
  });

  it("keeps fullscreen controls but removes the play toggle in live mode", async () => {
    document.body.appendChild(media);

    await service.play(media, "https://iptv.test/live/channel.m3u8", { mode: "live" });

    expect(videojs).toHaveBeenCalledWith(
      media,
      expect.objectContaining({
        autoplay: true,
        controls: true,
        liveui: true,
        controlBar: expect.objectContaining({
          fullscreenToggle: true,
          pictureInPictureToggle: false,
          playToggle: false,
        }),
      }),
    );
  });

  it("disposes the previous player before recreating it for a new source", async () => {
    document.body.appendChild(media);
    await service.play(media, "https://iptv.test/movie.mp4");

    const nextPlayer = {
      dispose: vi.fn(),
      isDisposed: vi.fn().mockReturnValue(false),
      play: vi.fn().mockResolvedValue(undefined),
      requestFullscreen: vi.fn().mockResolvedValue(undefined),
    };
    videojs.mockReturnValueOnce(nextPlayer);

    await service.play(media, "https://iptv.test/next.mp4");

    expect(player.dispose).toHaveBeenCalled();
    expect(nextPlayer.play).toHaveBeenCalled();
  });

  it("disposes the Video.js player on cleanup", async () => {
    document.body.appendChild(media);
    await service.play(media, "https://iptv.test/movie.mp4");

    service.dispose();

    expect(player.dispose).toHaveBeenCalled();
  });
});
