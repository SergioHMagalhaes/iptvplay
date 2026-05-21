import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { LUCIDE_ICONS } from "../../icons/lucide-icons";
import { VideoPlayerOptions, VideoPlayerService } from "../../services/video-player.service";

@Component({
  selector: "app-video-player-modal",
  standalone: true,
  imports: [CommonModule, LUCIDE_ICONS],
  templateUrl: "./video-player-modal.component.html",
})
export class VideoPlayerModalComponent implements OnChanges, OnDestroy {
  private readonly videoPlayer = inject(VideoPlayerService);
  private viewReady = false;

  @Input({ required: true }) src = "";
  @Input() title = "";
  @Input() mode: NonNullable<VideoPlayerOptions["mode"]> = "on-demand";
  @Output() readonly closed = new EventEmitter<void>();

  @ViewChild("playerMedia")
  set playerMedia(playerMedia: ElementRef<HTMLVideoElement> | undefined) {
    this.mediaElement = playerMedia?.nativeElement;
    this.viewReady = Boolean(this.mediaElement);
    void this.startPlayback();
  }

  private mediaElement?: HTMLVideoElement;

  ngOnChanges(): void {
    void this.startPlayback();
  }

  ngOnDestroy(): void {
    this.videoPlayer.dispose();
  }

  close(): void {
    this.videoPlayer.dispose();
    this.closed.emit();
  }

  private async startPlayback(): Promise<void> {
    if (!this.viewReady || !this.mediaElement || !this.src) return;

    await this.videoPlayer.play(this.mediaElement, this.src, { mode: this.mode });
  }
}
