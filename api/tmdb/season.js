const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default async function handler(request, response) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "TMDB_API_KEY is not configured." });
  }

  const seriesId = Number(request.query.seriesId);
  const season = Number(request.query.season);
  if (!seriesId || !season) {
    return response.status(400).json({ error: "seriesId and season are required." });
  }

  const seasonUrl = new URL(`${TMDB_BASE_URL}/tv/${seriesId}/season/${season}`);
  seasonUrl.searchParams.set("api_key", apiKey);
  seasonUrl.searchParams.set("language", "pt-BR");

  const details = await fetchJson(seasonUrl);

  return response.status(200).json({
    seasonNumber: details.season_number,
    episodes: (details.episodes ?? []).map((episode) => ({
      episodeNumber: episode.episode_number,
      title: episode.name,
      stillPath: episode.still_path,
      duration: episode.runtime,
    })),
  });
}

async function fetchJson(url) {
  const result = await fetch(url);
  if (!result.ok) {
    throw new Error(`TMDB request failed with ${result.status}`);
  }
  return result.json();
}
