import OpenAI from "openai";
import { stripHtml } from "../utils/text.js";

let client;

function getOpenAIClient() {
  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
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

  const response = await getOpenAIClient().responses.create({
    model: "gpt-4.1-mini",
    input: `
You are a precise news briefing editor.

Create a concise global news briefing from the provided articles.

STRICT RULES:
- Output ONLY the news summary.
- DO NOT add commentary, suggestions, or closing statements.
- DO NOT say things like "let me know", "if you want", etc.
- DO NOT include conversational text.
- DO NOT invent stories, facts, sources, quotes, dates, or numbers.
- Use only the article data provided.

Formatting:
- Use clean Markdown
- Keep it concise and structured
- Use exactly one Markdown heading per news source, formatted as "## Source Name".
- DO NOT create separate headings for individual stories.
- DO NOT create topic headings.
- Under each source heading, include 3-6 concise bullets covering that source's most important stories.
- If a source has several topics, keep them under the same source heading.
- When useful, start a bullet with a short topic label such as "Politics:", "Business:", "Climate:", "Science:", "Sports:", "Technology:", "Health:", "Culture:", or "World:".
- After each source's bullets, include one "Key themes:" line for that source only.
- Do not repeat "Key themes:" after every single story.

Coverage guidance:
- Prioritize important developments within each source.
- Include a range of topics when the source data supports it: politics, business, climate, science, sports, technology, health, culture, and world affairs.
- If a topic has no relevant articles, omit that topic.
- Keep bullets specific enough to explain what happened and why it matters.

NEWS DATA:

${input}
`,
  });

  return response.output_text;
}
