import { describe, it, expect, vi } from "vitest";

const parseURLMock = vi.fn();

vi.mock("rss-parser", () => {
  return {
    default: vi.fn().mockImplementation(function ParserMock() {
      return {
      parseURL: parseURLMock,
      };
    }),
  };
});

const { fetchNewsFromSource } = await import("../src/news/fetchNews.js");

describe("fetchNewsFromSource", () => {
  it("fetches and normalizes RSS articles", async () => {
    parseURLMock.mockResolvedValue({
      items: [
        {
          title: "Story one",
          link: "https://example.com/1",
          pubDate: "2026-04-29",
          contentSnippet: "Short summary",
        },
        {
          title: "Story two",
          link: "https://example.com/2",
          isoDate: "2026-04-28",
          description: "Description text",
        },
      ],
    });

    const result = await fetchNewsFromSource(
      {
        name: "Example News",
        feedUrl: "https://example.com/rss",
      },
      1
    );

    expect(result.source).toBe("Example News");
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0]).toEqual({
      title: "Story one",
      link: "https://example.com/1",
      published: "2026-04-29",
      content: "Short summary",
    });
  });

  it("returns an error result when RSS fetch fails", async () => {
    parseURLMock.mockRejectedValue(new Error("Feed failed"));

    const result = await fetchNewsFromSource({
      name: "Broken Feed",
      feedUrl: "https://broken.com/rss",
    });

    expect(result.source).toBe("Broken Feed");
    expect(result.articles).toEqual([]);
    expect(result.error).toBe("Feed failed");
  });
});
