const QUALITY_TAGS =
  /\b(4k|uhd|fhd|hd|sd|hdr|dv|dolby|atmos|1080p|720p|2160p|x264|x265|h264|h265|bluray|web-dl|webrip)\b/gi;
const EPISODE_PATTERN = /\bS\d{1,2}E\d{1,2}\b/gi;

export function sanitizeTitle(title: string): string {
  return title
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\((?:19|20)\d{2}\)/g, " ")
    .replace(EPISODE_PATTERN, " ")
    .replace(QUALITY_TAGS, " ")
    .replace(/\s+-\s*$/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
