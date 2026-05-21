import { inject, Injectable, InjectionToken } from "@angular/core";
import videojs from "video.js";

export interface VideoJsPlayer {
  dispose: () => void;
  isDisposed: () => boolean;
  play: () => Promise<void> | void;
}

export interface VideoPlayerOptions {
  mode?: "on-demand" | "live";
}

export type VideoJsFactory = (element: HTMLVideoElement, options: VideoJsOptions) => VideoJsPlayer;

interface VideoJsOptions {
  autoplay: boolean;
  controls: boolean;
  controlBar: {
    fullscreenToggle: boolean;
    pictureInPictureToggle: boolean;
    playToggle: boolean;
  };
  disablePictureInPicture: boolean;
  fill: boolean;
  fluid: boolean;
  html5: {
    vhs: Record<string, never>;
  };
  liveui?: boolean;
  playsinline: boolean;
  preload: "auto";
  sources: VideoJsSource[];
}

interface VideoJsSource {
  src: string;
  type: string;
}

export const VIDEOJS_FACTORY = new InjectionToken<VideoJsFactory>("VIDEOJS_FACTORY", {
  providedIn: "root",
  factory: () => videojs as unknown as VideoJsFactory,
});

@Injectable({ providedIn: "root" })
export class VideoPlayerService {
  private readonly videojs = inject(VIDEOJS_FACTORY);
  private player?: VideoJsPlayer;

  async play(mediaElement: HTMLVideoElement, src: string, options: VideoPlayerOptions = {}): Promise<void> {
    if (!mediaElement.isConnected) return;

    this.dispose();
    mediaElement.setAttribute("playsinline", "");
    mediaElement.setAttribute("disablepictureinpicture", "");

    this.player = this.videojs(mediaElement, this.createOptions(src, options));

    await Promise.resolve(this.player.play()).catch(() => undefined);
  }

  dispose(): void {
    const player = this.player;
    if (!player) return;

    if (!player.isDisposed()) {
      player.dispose();
    }
    this.player = undefined;
  }

  private createOptions(src: string, options: VideoPlayerOptions): VideoJsOptions {
    const isLive = options.mode === "live";

    return {
      autoplay: true,
      controls: true,
      controlBar: {
        fullscreenToggle: true,
        pictureInPictureToggle: false,
        playToggle: !isLive,
      },
      disablePictureInPicture: true,
      fill: true,
      fluid: false,
      html5: {
        vhs: {},
      },
      liveui: isLive || undefined,
      playsinline: true,
      preload: "auto",
      sources: [{ src, type: resolveSourceType(src) }],
    };
  }
}

function resolveSourceType(src: string): string {
  const pathname = src.split("?")[0]?.toLowerCase() ?? src.toLowerCase();
  if (pathname.endsWith(".m3u8")) return "application/x-mpegURL";
  if (pathname.endsWith(".webm")) return "video/webm";
  if (pathname.endsWith(".ogg") || pathname.endsWith(".ogv")) return "video/ogg";
  return "video/mp4";
}
