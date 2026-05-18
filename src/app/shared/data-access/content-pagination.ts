import { Signal, signal } from "@angular/core";
import { IptvCategory } from "../../core/models/iptv-content.model";

export interface CategorySection<TItem> {
  category: IptvCategory;
  items: TItem[];
  hasMoreItems: boolean;
  isLoadingItems: boolean;
}

export interface CategorySectionsLoaderConfig<TItem> {
  categoryPageSize: number;
  itemPageSize: number;
  errorMessage: string;
  getCategories: (playlistId: number, offset: number, limit: number) => Promise<IptvCategory[]>;
  getItemsByCategory: (playlistId: number, categoryId: string, offset: number, limit: number) => Promise<TItem[]>;
}

export class CategorySectionsLoader<TItem> {
  private readonly sectionsState = signal<CategorySection<TItem>[]>([]);
  private readonly isLoadingState = signal(false);
  private readonly hasMoreCategoriesState = signal(true);
  private readonly errorMessageState = signal<string | null>(null);

  readonly sections: Signal<CategorySection<TItem>[]> = this.sectionsState.asReadonly();
  readonly isLoading: Signal<boolean> = this.isLoadingState.asReadonly();
  readonly hasMoreCategories: Signal<boolean> = this.hasMoreCategoriesState.asReadonly();
  readonly errorMessage: Signal<string | null> = this.errorMessageState.asReadonly();

  constructor(private readonly config: CategorySectionsLoaderConfig<TItem>) {}

  async loadMoreCategories(playlistId: number | null): Promise<void> {
    if (this.isLoadingState() || !this.hasMoreCategoriesState() || playlistId === null) {
      return;
    }

    this.isLoadingState.set(true);
    try {
      const offset = this.sectionsState().length;
      const categories = await this.config.getCategories(playlistId, offset, this.config.categoryPageSize);
      const newSections = await Promise.all(
        categories.map(async (category) => {
          const items = await this.config.getItemsByCategory(
            playlistId,
            category.externalId,
            0,
            this.config.itemPageSize,
          );
          return {
            category,
            items,
            hasMoreItems: items.length === this.config.itemPageSize,
            isLoadingItems: false,
          };
        }),
      );

      this.sectionsState.update((sections) => [...sections, ...newSections]);
      this.hasMoreCategoriesState.set(categories.length === this.config.categoryPageSize);
    } catch (error) {
      this.errorMessageState.set(error instanceof Error ? error.message : this.config.errorMessage);
    } finally {
      this.isLoadingState.set(false);
    }
  }

  async loadMoreItems(playlistId: number | null, categoryId: string): Promise<void> {
    if (playlistId === null) return;

    const section = this.sectionsState().find((item) => item.category.externalId === categoryId);
    if (!section || section.isLoadingItems || !section.hasMoreItems) return;

    this.patchSection(categoryId, { isLoadingItems: true });
    const items = await this.config.getItemsByCategory(
      playlistId,
      categoryId,
      section.items.length,
      this.config.itemPageSize,
    );
    this.patchSection(categoryId, {
      items: [...section.items, ...items],
      hasMoreItems: items.length === this.config.itemPageSize,
      isLoadingItems: false,
    });
  }

  private patchSection(categoryId: string, patch: Partial<CategorySection<TItem>>): void {
    this.sectionsState.update((sections) =>
      sections.map((section) => (section.category.externalId === categoryId ? { ...section, ...patch } : section)),
    );
  }
}

export interface CategoryPageLoaderConfig<TItem> {
  pageSize: number;
  getCategory: (playlistId: number, categoryId: string) => Promise<IptvCategory | undefined>;
  getItemsByCategory: (playlistId: number, categoryId: string, offset: number, limit: number) => Promise<TItem[]>;
}

export class CategoryPageLoader<TItem> {
  private readonly categoryState = signal<IptvCategory | undefined>(undefined);
  private readonly itemsState = signal<TItem[]>([]);
  private readonly hasMoreItemsState = signal(true);
  private readonly isLoadingState = signal(false);

  readonly category: Signal<IptvCategory | undefined> = this.categoryState.asReadonly();
  readonly items: Signal<TItem[]> = this.itemsState.asReadonly();
  readonly hasMoreItems: Signal<boolean> = this.hasMoreItemsState.asReadonly();
  readonly isLoading: Signal<boolean> = this.isLoadingState.asReadonly();

  constructor(private readonly config: CategoryPageLoaderConfig<TItem>) {}

  async init(playlistId: number | null, categoryId: string): Promise<void> {
    if (playlistId === null || !categoryId) return;

    this.categoryState.set(await this.config.getCategory(playlistId, categoryId));
    await this.loadMore(playlistId, categoryId);
  }

  async loadMore(playlistId: number | null, categoryId: string): Promise<void> {
    if (playlistId === null || !categoryId || this.isLoadingState() || !this.hasMoreItemsState()) {
      return;
    }

    this.isLoadingState.set(true);
    const nextItems = await this.config.getItemsByCategory(
      playlistId,
      categoryId,
      this.itemsState().length,
      this.config.pageSize,
    );
    this.itemsState.update((items) => [...items, ...nextItems]);
    this.hasMoreItemsState.set(nextItems.length === this.config.pageSize);
    this.isLoadingState.set(false);
  }

  queueAnotherLoadIfNeeded(
    playlistId: number | null,
    categoryId: string,
    isNearViewport: () => boolean | undefined,
  ): void {
    setTimeout(() => {
      if (this.hasMoreItemsState() && isNearViewport()) {
        void this.loadMore(playlistId, categoryId);
      }
    });
  }
}
