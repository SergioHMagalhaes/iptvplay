import { Component, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { PlaylistService } from "../../../../core/services/playlist.service";
import { PlaylistEntry } from "../../../../core/models/playlist.model";
import { LUCIDE_ICONS } from "../../../../shared/icons/lucide-icons";

@Component({
  selector: "app-playlist-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LUCIDE_ICONS],
  templateUrl: "./playlist-form.component.html",
  styleUrl: "./playlist-form.component.scss",
})
export class PlaylistFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private playlistService = inject(PlaylistService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  playlistId = signal<number | null>(null);
  private existingNames: string[] = [];

  playlistForm = this.fb.nonNullable.group({
    name: ["", [Validators.required]],
    sourceType: ["xtream" as "xtream" | "m3u_url", Validators.required],
    domain: ["", [Validators.required]],
    username: ["", [Validators.required]],
    password: ["", [Validators.required]],
    url: [""],
    forceM3u: [false],
    epgUrl: [""],
  });

  ngOnInit(): void {
    this.playlistService.getAllPlaylists().then((playlists) => {
      this.existingNames = playlists.map((p) => p.name);
      this.updateNameValidator();
    });

    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.loadPlaylist(Number(idParam));
    }

    this.onSourceTypeChange();
  }

  loadPlaylist(id: number): void {
    this.isLoading.set(true);
    this.playlistService.getPlaylistById(id).then((playlist) => {
      if (playlist) {
        this.isEditMode.set(true);
        this.playlistId.set(id);
        this.playlistForm.patchValue({
          name: playlist.name,
          sourceType: playlist.sourceType,
          domain: playlist.domain || "",
          username: playlist.username || "",
          password: playlist.password || "",
          url: playlist.url || "",
          forceM3u: playlist.forceM3u || false,
          epgUrl: playlist.epgUrl || "",
        });
        this.onSourceTypeChange();

        this.existingNames = this.existingNames.filter((n) => n !== playlist.name);
        this.updateNameValidator();
      }
      this.isLoading.set(false);
    });
  }

  onSourceTypeChange(): void {
    const sourceType = this.playlistForm.controls.sourceType.value;

    if (sourceType === "xtream") {
      this.playlistForm.controls.url.setValue("");
      this.playlistForm.controls.forceM3u.setValue(false);
      this.playlistForm.controls.url.clearValidators();

      this.playlistForm.controls.domain.setValidators([Validators.required]);
      this.playlistForm.controls.username.setValidators([Validators.required]);
      this.playlistForm.controls.password.setValidators([Validators.required]);
    } else {
      this.playlistForm.controls.domain.setValue("");
      this.playlistForm.controls.username.setValue("");
      this.playlistForm.controls.password.setValue("");
      this.playlistForm.controls.domain.clearValidators();
      this.playlistForm.controls.username.clearValidators();
      this.playlistForm.controls.password.clearValidators();

      this.playlistForm.controls.url.setValidators([Validators.required]);
    }

    this.playlistForm.controls.domain.updateValueAndValidity();
    this.playlistForm.controls.username.updateValueAndValidity();
    this.playlistForm.controls.password.updateValueAndValidity();
    this.playlistForm.controls.url.updateValueAndValidity();
  }

  save(): void {
    if (this.playlistForm.invalid) return;

    this.isLoading.set(true);
    const formValue = this.playlistForm.getRawValue();
    const now = new Date().toISOString();

    if (this.isEditMode() && this.playlistId() !== null) {
      const updateData: Partial<PlaylistEntry> = {
        name: formValue.name,
        sourceType: formValue.sourceType,
        domain: formValue.domain || undefined,
        username: formValue.username || undefined,
        password: formValue.password || undefined,
        url: formValue.url || undefined,
        forceM3u: formValue.forceM3u || undefined,
        epgUrl: formValue.epgUrl || undefined,
        updatedAt: now,
      };
      this.playlistService.updatePlaylist(this.playlistId()!, updateData).then(() => {
        this.isLoading.set(false);
        this.router.navigate(["/playlists"]);
      });
    } else {
      const newPlaylist: PlaylistEntry = {
        name: formValue.name,
        sourceType: formValue.sourceType,
        domain: formValue.domain || undefined,
        username: formValue.username || undefined,
        password: formValue.password || undefined,
        url: formValue.url || undefined,
        forceM3u: formValue.forceM3u || undefined,
        epgUrl: formValue.epgUrl || undefined,
        createdAt: now,
        updatedAt: now,
      };
      this.playlistService.addPlaylist(newPlaylist).then(() => {
        this.isLoading.set(false);
        this.router.navigate(["/playlists"]);
      });
    }
  }

  cancel(): void {
    this.router.navigate(["/playlists"]);
  }

  exit(): void {
    this.router.navigate(["/"]);
  }

  private updateNameValidator(): void {
    const existingNames = this.existingNames;
    this.playlistForm.controls.name.setValidators([
      Validators.required,
      (control: AbstractControl): ValidationErrors | null => {
        if (existingNames.some((n) => n.toLowerCase() === control.value?.toLowerCase())) {
          return { duplicateName: true };
        }
        return null;
      },
    ]);
    this.playlistForm.controls.name.updateValueAndValidity();
  }
}
