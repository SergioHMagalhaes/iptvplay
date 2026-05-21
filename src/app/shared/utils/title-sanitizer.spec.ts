import { sanitizeTitle } from "./title-sanitizer";

describe("sanitizeTitle", () => {
  it("removes years, quality tags, and bracketed labels from IPTV names", () => {
    expect(sanitizeTitle("007: No Time to Die (2021) [4K]")).toBe("007: No Time to Die");
    expect(sanitizeTitle("The Last of Us S01E01 [FHD]")).toBe("The Last of Us");
    expect(sanitizeTitle("Dune: Part Two - 1080p")).toBe("Dune: Part Two");
    expect(sanitizeTitle("1917 (2019) [4K]")).toBe("1917");
  });

  it("keeps punctuation that belongs to the real title", () => {
    expect(sanitizeTitle("Spider-Man: No Way Home")).toBe("Spider-Man: No Way Home");
  });
});
