export interface PlaylistEntry {
  id?: number;
  name: string;
  sourceType: "xtream" | "m3u_url";
  domain?: string;
  username?: string;
  password?: string;
  url?: string;
  forceM3u?: boolean;
  epgUrl?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
