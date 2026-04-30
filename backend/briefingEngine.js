import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function stripHtml(html = "") {
  return html.replace(/<[^>]*>?/gm, "").trim();
}

export async function generateBriefing(newsBySource) {
  const input = newsBySource
    .map((source) => {
      const articles = source.articles
        .map(
          (article, index) => `
${index + 1}. ${stripHtml(article.title)}
Published: ${article.published || "Unknown"}
Link: ${article.link}
Content: ${stripHtml(article.content)}
`
        )
        .join("\n");

      return `
SOURCE: ${source.source}

${articles || "No articles found."}
`;
    })
    .join("\n---\n");

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
You are a news assistant.

Summarize the top news from each source.

STRICT RULES:
- Output ONLY the news summary.
- DO NOT add commentary, suggestions, or closing statements.
- DO NOT say things like "let me know", "if you want", etc.
- DO NOT include conversational text.

Formatting:
- Use clean Markdown
- Keep it concise and structured

For each source, return:
- 3-5 bullet summary
- key themes

Use only the article data provided.

NEWS DATA:

${input}
`,
  });

  return response.output_text;
}
