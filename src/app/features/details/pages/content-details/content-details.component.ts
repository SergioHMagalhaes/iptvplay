import { CommonModule } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LUCIDE_ICONS } from "../../../../shared/icons/lucide-icons";
import { TmdbContentDetails, TmdbEpisodeDetails, TmdbService } from "../../../../core/services/tmdb.service";
import {
  ContentDetails,
  ContentDetailsService,
  DetailKind,
  SeriesEpisode,
} from "../../data-access/content-details.service";
import { VideoPlayerService } from "../../data-access/video-player.service";

interface UiEpisode {
  id: number;
  season: number;
  episodeNumber: number;
  title: string;
  image?: string;
  duration?: string;
  extension?: string;
}

@Component({
  selector: "app-content-details",
  standalone: true,
  imports: [CommonModule, LUCIDE_ICONS],
  templateUrl: "./content-details.component.html",
  styleUrl: "./content-details.component.scss",
})
export class ContentDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private detailsService = inject(ContentDetailsService);
  private tmdbService = inject(TmdbService);
  private videoPlayer = inject(VideoPlayerService);
  private cdr = inject(ChangeDetectorRef);

  readonly details = signal<ContentDetails | null>(null);
  readonly tmdbDetails = signal<TmdbContentDetails | null>(null);
  readonly playlistEpisodes = signal<SeriesEpisode[]>([]);
  readonly episodes = signal<UiEpisode[]>([]);
  readonly selectedSeason = signal(1);
  readonly playbackUrl = signal<string | null>(null);
  readonly isPlayerOpen = signal(false);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  //@ViewChild("playerRoot") private playerRoot?: ElementRef<HTMLElement>;
  @ViewChild("playerMedia") private playerMedia?: ElementRef<HTMLVideoElement>;

  readonly kind = computed(() => this.details()?.kind ?? this.route.snapshot.paramMap.get("kind"));
  readonly title = computed(() => this.tmdbDetails()?.title || this.details()?.name || "");
  readonly synopsis = computed(
    () => this.tmdbDetails()?.overview || this.details()?.synopsis || "Sinopse indisponível.",
  );
  readonly bannerUrl = computed(
    () => this.tmdbService.imageUrl(this.tmdbDetails()?.backdropPath) || this.details()?.fallbackImage,
  );
  readonly logoUrl = computed(() => this.tmdbService.imageUrl(this.tmdbDetails()?.logoPath, "w500"));
  readonly seasons = computed(() => {
    const total =
      this.tmdbDetails()?.numberOfSeasons ?? Math.max(...this.playlistEpisodes().map((episode) => episode.season), 1);
    return Array.from({ length: total }, (_, index) => index + 1);
  });
  readonly infoItems = computed(() =>
    [
      this.tmdbDetails()?.runtime ? `${this.tmdbDetails()?.runtime} min` : null,
      this.tmdbDetails()?.year,
      this.tmdbDetails()?.voteAverage ? this.tmdbDetails()?.voteAverage?.toFixed(1) : null,
      this.tmdbDetails()?.genres?.[0],
    ].filter(Boolean),
  );

  async ngOnInit(): Promise<void> {
    const kind = this.route.snapshot.paramMap.get("kind") as DetailKind | null;
    const externalId = Number(this.route.snapshot.paramMap.get("externalId"));
    if ((kind !== "movie" && kind !== "series") || Number.isNaN(externalId)) {
      this.errorMessage.set("Conteúdo inválido.");
      this.isLoading.set(false);
      return;
    }

    try {
      const details = await this.detailsService.getDetails(kind, externalId);
      this.details.set(details);
      if (!details) {
        this.errorMessage.set("Conteúdo não encontrado.");
        return;
      }

      const tmdb = await this.tmdbService.search(kind, details.name);
      this.tmdbDetails.set(tmdb);

      if (kind === "series") {
        this.playlistEpisodes.set(await this.detailsService.getSeriesEpisodes(externalId));
        await this.loadSeason(1);
      }
    } catch {
      this.errorMessage.set("Não foi possível carregar os detalhes.");
    } finally {
      this.isLoading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.closePlayer(false);
  }

  async selectSeason(season: number): Promise<void> {
    this.selectedSeason.set(season);
    await this.loadSeason(season);
  }

  async playMain(): Promise<void> {
    const details = this.details();
    if (!details) return;

    if (details.kind === "series") {
      await this.playEpisode(this.episodes()[0]);
      return;
    }

    await this.startPlayback(details.kind, details.externalId);
  }

  async playEpisode(episode?: UiEpisode): Promise<void> {
    if (!episode) return;

    await this.startPlayback("series", episode.id, episode.extension);
  }

  private async loadSeason(season: number): Promise<void> {
    const tmdbId = this.tmdbDetails()?.id;
    const playlistEpisodes = this.playlistEpisodes().filter((episode) => episode.season === season);

    if (!tmdbId) {
      this.episodes.set(playlistEpisodes);
      return;
    }

    const tmdbSeason = await this.tmdbService.getSeason(tmdbId, season);
    this.episodes.set(
      playlistEpisodes.map((episode) => ({
        ...episode,
        ...this.findTmdbEpisode(tmdbSeason.episodes, episode),
      })),
    );
  }

  private findTmdbEpisode(tmdbEpisodes: TmdbEpisodeDetails[], episode: SeriesEpisode): Partial<UiEpisode> {
    const tmdbEpisode = tmdbEpisodes.find((item) => item.episodeNumber === episode.episodeNumber);
    if (!tmdbEpisode) return {};

    return {
      title: tmdbEpisode.title || episode.title,
      image: this.tmdbService.imageUrl(tmdbEpisode.stillPath, "w500") || episode.image,
      duration: tmdbEpisode.duration ? `${tmdbEpisode.duration} min` : episode.duration,
    };
  }

  private async startPlayback(kind: DetailKind, externalId: number, extension?: string): Promise<void> {
    const url = extension
      ? await this.detailsService.getPlaybackUrl(kind, externalId, extension)
      : await this.detailsService.getPlaybackUrl(kind, externalId);
    this.playbackUrl.set(url);
    this.isPlayerOpen.set(true);
    this.cdr.detectChanges();

    //const playerRoot = this.playerRoot?.nativeElement;
    const mediaElement = this.playerMedia?.nativeElement;
    if (!mediaElement?.isConnected) return;

    await this.videoPlayer.play(mediaElement, url);
  }

  closePlayer(exitFullscreen = true): void {
    this.videoPlayer.dispose();
    this.playbackUrl.set(null);
    this.isPlayerOpen.set(false);

    // if (exitFullscreen && document.fullscreenElement && document.exitFullscreen) {
    //   void document.exitFullscreen().catch(() => undefined);
    // }
  }
}
