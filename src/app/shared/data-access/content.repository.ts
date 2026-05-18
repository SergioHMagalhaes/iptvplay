import { Table } from "dexie";
import { PlaylistDatabase } from "../../core/database/playlist.db";
import { IptvCategory, IptvCategoryType } from "../../core/models/iptv-content.model";

export type CategorizedContent = {
  playlistId: number;
  categoryId: string;
};

export class ContentRepository<TContent extends CategorizedContent> {
  constructor(
    private readonly db: PlaylistDatabase,
    private readonly categoryType: IptvCategoryType,
    private readonly contentTable: Table<TContent, number>,
  ) {}

  async getCategories(playlistId: number, offset: number, limit: number): Promise<IptvCategory[]> {
    return this.db.categories
      .where("[playlistId+type]")
      .equals([playlistId, this.categoryType])
      .offset(offset)
      .limit(limit)
      .toArray();
  }

  async getCategory(playlistId: number, categoryId: string): Promise<IptvCategory | undefined> {
    return this.db.categories
      .where("[playlistId+externalId]")
      .equals([playlistId, categoryId])
      .and((category) => category.type === this.categoryType)
      .first();
  }

  async getItemsByCategory(playlistId: number, categoryId: string, offset: number, limit: number): Promise<TContent[]> {
    return this.contentTable
      .where("categoryId")
      .equals(categoryId)
      .and((item) => item.playlistId === playlistId)
      .offset(offset)
      .limit(limit)
      .toArray();
  }
}
