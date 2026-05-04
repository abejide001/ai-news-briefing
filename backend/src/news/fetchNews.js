import Parser from "rss-parser";
import { NEWS_SOURCES } from "../config/sources.js";
import { cleanText, extractHref } from "../utils/text.js";

const parser = new Parser({
  headers: {
    "User-Agent": "Mozilla/5.0",
  },
});

export async function fetchNewsFromSource(source, limit = 5) {
  try {
    const feed = await parser.parseURL(source.feedUrl);

    return {
      source: source.name,
      feedUrl: source.feedUrl,
      articles: feed.items.slice(0, limit).map((item) => {
        const fallbackLink =
          extractHref(item.title) ||
          extractHref(item.content) ||
          extractHref(item.description);

        return {
          title: cleanText(item.title),
          link: item.link || fallbackLink,
          published: item.pubDate || item.isoDate || null,
          content: cleanText(
            item.contentSnippet ||
              item.content ||
              item.summary ||
              item.description ||
              ""
          ),
        };
      }),
    };
  } catch (error) {
    return {
      source: source.name,
      feedUrl: source.feedUrl,
      error: error.message,
      articles: [],
    };
  }
}

export async function fetchAllNews(limit = 5) {
  return Promise.all(
    NEWS_SOURCES.map((source) => fetchNewsFromSource(source, limit))
  );
}
