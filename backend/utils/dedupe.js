import stringSimilarity from "string-similarity";

function normalizeTitle(title = "") {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function deduplicateStories(newsBySource, threshold = 0.55) {
  const allArticles = newsBySource.flatMap((source) =>
    source.articles.map((article) => ({
      ...article,
      source: source.source,
    }))
  );

  const groups = [];

  for (const article of allArticles) {
    const normalizedTitle = normalizeTitle(article.title);

    let matchedGroup = null;

    for (const group of groups) {
      const score = stringSimilarity.compareTwoStrings(
        normalizedTitle,
        group.normalizedTitle
      );

      if (score >= threshold) {
        matchedGroup = group;
        break;
      }
    }

    if (matchedGroup) {
      matchedGroup.articles.push(article);
      matchedGroup.sources.add(article.source);
    } else {
      groups.push({
        normalizedTitle,
        mainTitle: article.title,
        sources: new Set([article.source]),
        articles: [article],
      });
    }
  }

  return groups.map((group) => ({
    title: group.mainTitle,
    sources: [...group.sources],
    articles: group.articles,
    links: group.articles.map((article) => ({
      source: article.source,
      title: article.title,
      link: article.link,
    })),
  }));
}
