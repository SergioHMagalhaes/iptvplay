export type IptvCategoryType = "tv" | "movie" | "series";

export interface IptvCategory {
  id?: number;
  playlistId: number;
  externalId: string;
  name: string;
  type: IptvCategoryType;
  createdAt: string;
  updatedAt: string;
}

export interface IptvMovie {
  id?: number;
  playlistId: number;
  externalId: number;
  categoryId: string;
  name: string;
  streamIcon?: string;
  added?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IptvSeries {
  id?: number;
  playlistId: number;
  externalId: number;
  categoryId: string;
  name: string;
  cover?: string;
  plot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IptvTvChannel {
  id?: number;
  playlistId: number;
  externalId: number;
  categoryId: string;
  name: string;
  streamIcon?: string;
  epgChannelId?: string;
  createdAt: string;
  updatedAt: string;
}
