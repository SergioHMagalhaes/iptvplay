import { vi } from "vitest";
import { CategoryPageLoader, CategorySectionsLoader } from "./content-pagination";

const category = {
  externalId: "10",
  name: "Action",
  playlistId: 1,
  type: "movie" as const,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

const contentItem = {
  externalId: 1,
  categoryId: "10",
  playlistId: 1,
  name: "Item 1",
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};

describe("CategorySectionsLoader", () => {
  it("loads category sections with their first item page", async () => {
    const loader = new CategorySectionsLoader({
      categoryPageSize: 8,
      itemPageSize: 12,
      errorMessage: "Não foi possível carregar.",
      getCategories: vi.fn().mockResolvedValue([category]),
      getItemsByCategory: vi.fn().mockResolvedValue([contentItem]),
    });

    await loader.loadMoreCategories(1);

    expect(loader.sections()).toEqual([
      {
        category,
        items: [contentItem],
        hasMoreItems: false,
        isLoadingItems: false,
      },
    ]);
    expect(loader.hasMoreCategories()).toBe(false);
  });

  it("loads more items into an existing section", async () => {
    const getItemsByCategory = vi
      .fn()
      .mockResolvedValueOnce(Array.from({ length: 12 }, (_, index) => ({ ...contentItem, externalId: index + 1 })))
      .mockResolvedValueOnce([]);
    const loader = new CategorySectionsLoader({
      categoryPageSize: 8,
      itemPageSize: 12,
      errorMessage: "Não foi possível carregar.",
      getCategories: vi.fn().mockResolvedValue([category]),
      getItemsByCategory,
    });

    await loader.loadMoreCategories(1);
    await loader.loadMoreItems(1, "10");

    expect(getItemsByCategory).toHaveBeenLastCalledWith(1, "10", 12, 12);
    expect(loader.sections()[0].items).toHaveLength(12);
    expect(loader.sections()[0].hasMoreItems).toBe(false);
  });
});

describe("CategoryPageLoader", () => {
  it("loads category metadata and the first item page", async () => {
    const getCategory = vi.fn().mockResolvedValue(category);
    const getItemsByCategory = vi.fn().mockResolvedValue([contentItem]);
    const loader = new CategoryPageLoader({
      pageSize: 24,
      getCategory,
      getItemsByCategory,
    });

    await loader.init(1, "10");

    expect(getCategory).toHaveBeenCalledWith(1, "10");
    expect(getItemsByCategory).toHaveBeenCalledWith(1, "10", 0, 24);
    expect(loader.category()).toEqual(category);
    expect(loader.items()).toEqual([contentItem]);
  });
});
