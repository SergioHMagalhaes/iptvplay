import { inject, Injectable } from "@angular/core";
import { IptvMovie, IptvSeries, IptvTvChannel } from "../../../../core/models/iptv-content.model";
import { SelectedPlaylistService } from "../../../../core/services/selected-playlist.service";
import { sanitizeTitle } from "../../../../shared/utils/title-sanitizer";
import { SearchRepository } from "../repositories/search.repository";

export type SearchResultKind = "movie" | "series" | "tv";

export interface SearchResult {
  externalId: number;
  imageUrl?: string;
  kind: SearchResultKind;
  name: string;
}

@Injectable({ providedIn: "root" })
export class SearchService {
  private readonly repository = inject(SearchRepository);
  private readonly selectedPlaylistService = inject(SelectedPlaylistService);

  async search(query: string): Promise<SearchResult[]> {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) {
      return [];
    }

    const playlistId = await this.selectedPlaylistService.getSelectedPlaylistId();
    if (playlistId === null) {
      return [];
    }

    const content = await this.repository.getSearchableContent(playlistId);
    const results: SearchResult[] = [
      ...content.movies.map(toMovieResult),
      ...content.series.map(toSeriesResult),
      ...content.tv.map(toTvResult),
    ];

    return this.rank(results, normalizedQuery).slice(0, 20);
  }

  private rank(results: SearchResult[], query: string): SearchResult[] {
    return results
      .map((result) => ({ result, score: matchScore(result.name, query) }))
      .filter((entry) => entry.score !== null)
      .sort(
        (first, second) =>
          (first.score ?? 0) - (second.score ?? 0) || first.result.name.localeCompare(second.result.name),
      )
      .map((entry) => entry.result);
  }
}

function toMovieResult(movie: IptvMovie): SearchResult {
  return {
    externalId: movie.externalId,
    imageUrl: movie.streamIcon,
    kind: "movie",
    name: movie.name,
  };
}

function toSeriesResult(series: IptvSeries): SearchResult {
  return {
    externalId: series.externalId,
    imageUrl: series.cover,
    kind: "series",
    name: series.name,
  };
}

function toTvResult(channel: IptvTvChannel): SearchResult {
  return {
    externalId: channel.externalId,
    imageUrl: channel.streamIcon,
    kind: "tv",
    name: channel.name,
  };
}

function matchScore(name: string, query: string): number | null {
  const title = normalizeSearchText(name);

  if (title === query) {
    return 0;
  }

  const terms = title.split(" ");
  const queryTerms = query.split(" ");

  // Ex: "dexter" bate em "dexter 2006"
  if (terms[0] === query) {
    return 1;
  }

  // Ex: "the last" bate em "the last of us"
  if (title.startsWith(query + " ")) {
    return 2;
  }

  // Ex: "dexter" bate como palavra exata em "o laboratorio de dexter"
  if (queryTerms.every((queryTerm) => terms.includes(queryTerm))) {
    return 3;
  }

  // Só usa fuzzy se a busca tiver pelo menos 4 caracteres
  if (
    query.length >= 4 &&
    queryTerms.every((queryTerm) => terms.some((term) => strictFuzzyTermMatch(term, queryTerm)))
  ) {
    return 4;
  }

  return null;
}

function strictFuzzyTermMatch(term: string, query: string): boolean {
  if (query.length < 4 || term.length < 4) {
    return false;
  }

  // Permite prefixo, mas não qualquer "contains"
  // Ex: "dext" encontra "dexter"
  if (term.startsWith(query)) {
    return true;
  }

  // Evita que uma palavra muito menor bata em uma muito maior
  const maxLength = Math.max(term.length, query.length);
  const minLength = Math.min(term.length, query.length);

  if (minLength / maxLength < 0.75) {
    return false;
  }

  const distance = editDistance(term, query);

  if (maxLength <= 6) {
    return distance <= 1;
  }

  return distance <= 2;
}

function fuzzyTermMatch(term: string, query: string): boolean {
  if (term.includes(query) || query.includes(term)) {
    return true;
  }

  if (Math.min(term.length, query.length) < 4) {
    return false;
  }

  return editDistance(term, query) <= (Math.max(term.length, query.length) > 8 ? 2 : 1);
}

function normalizeSearchText(value: string): string {
  return sanitizeTitle(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function editDistance(first: string, second: string): number {
  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);

  for (let firstIndex = 1; firstIndex <= first.length; firstIndex += 1) {
    let diagonal = previous[0];
    previous[0] = firstIndex;

    for (let secondIndex = 1; secondIndex <= second.length; secondIndex += 1) {
      const last = previous[secondIndex];
      const cost = first[firstIndex - 1] === second[secondIndex - 1] ? 0 : 1;
      previous[secondIndex] = Math.min(previous[secondIndex] + 1, previous[secondIndex - 1] + 1, diagonal + cost);
      diagonal = last;
    }
  }

  return previous[second.length];
}
