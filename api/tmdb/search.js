const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export default async function handler(request, response) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: "TMDB_API_KEY is not configured." });
  }

  const type = request.query.type === "series" ? "tv" : "movie";
  const query = String(request.query.query || "").trim();
  if (!query) {
    return response.status(400).json({ error: "query is required." });
  }

  const searchUrl = new URL(`${TMDB_BASE_URL}/search/${type}`);
  searchUrl.searchParams.set("api_key", apiKey);
  searchUrl.searchParams.set("query", query);
  searchUrl.searchParams.set("include_adult", "false");
  searchUrl.searchParams.set("language", "pt-BR");

  const searchResult = await fetchJson(searchUrl);
  const first = searchResult.results?.[0];
  if (!first) {
    return response.status(200).json(null);
  }

  const detailsUrl = new URL(`${TMDB_BASE_URL}/${type}/${first.id}`);
  detailsUrl.searchParams.set("api_key", apiKey);
  detailsUrl.searchParams.set("append_to_response", "images");
  detailsUrl.searchParams.set("include_image_language", "pt,en,null");
  detailsUrl.searchParams.set("language", "pt-BR");

  const details = await fetchJson(detailsUrl);
  const logo = details.images?.logos?.find((item) => item.iso_639_1 === "pt") ?? details.images?.logos?.[0];

  return response.status(200).json({
    id: details.id,
    title: details.title || details.name,
    overview: details.overview,
    backdropPath: details.backdrop_path,
    logoPath: logo?.file_path,
    year: (details.release_date || details.first_air_date || "").slice(0, 4),
    runtime: details.runtime || details.episode_run_time?.[0],
    voteAverage: details.vote_average,
    genres: details.genres?.map((genre) => genre.name) ?? [],
    numberOfSeasons: details.number_of_seasons,
  });
}

async function fetchJson(url) {
  const result = await fetch(url);
  if (!result.ok) {
    throw new Error(`TMDB request failed with ${result.status}`);
  }
  return result.json();
}
