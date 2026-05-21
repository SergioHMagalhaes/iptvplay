import { inject, Injectable } from "@angular/core";
import { IptvCategory, IptvMovie } from "../../../../core/models/iptv-content.model";
import { MoviesRepository } from "../repositories/movies.repository";

@Injectable({ providedIn: "root" })
export class MoviesService {
  private repository = inject(MoviesRepository);

  getMovieCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.repository.getMovieCategories(playlistId, offset, limit);
  }

  getMovieCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.repository.getMovieCategory(playlistId, categoryId);
  }

  getMoviesByCategory(playlistId: number, categoryId: string, offset: number, limit: number): Promise<IptvMovie[]> {
    return this.repository.getMoviesByCategory(playlistId, categoryId, offset, limit);
  }

  getMovieByExternalId(playlistId: number, externalId: number): Promise<IptvMovie | undefined> {
    return this.repository.getMovieByExternalId(playlistId, externalId);
  }
}
