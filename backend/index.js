#!/usr/bin/env node

import "dotenv/config";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { fetchAllNews } from "./news.js";
import { summarizeNews } from "./summarizer.js";
import { generateMarkdownReport, saveReport } from "./report.js";
import { deduplicateStories } from "./dedupe.js";

const argv = yargs(hideBin(process.argv))
  .usage("Usage: topnews [options]")
  .option("limit", {
    alias: "l",
    type: "number",
    default: 5,
    describe: "Number of articles per source",
  })
  .option("output", {
    alias: "o",
    type: "string",
    default: "news-report.md",
    describe: "Markdown report output file",
  })
  .option("dedupe-threshold", {
    type: "number",
    default: 0.55,
    describe: "Similarity threshold for deduping stories",
  })
  .help()
  .parseSync();

async function main() {
  const newsBySource = await fetchAllNews(argv.limit);

  const storyGroups = deduplicateStories(newsBySource, argv.dedupeThreshold);

  const summary = await summarizeNews(storyGroups);

  const report = generateMarkdownReport(newsBySource, summary);

  await saveReport(argv.output, report);

  console.log(`\nSaved report to ${argv.output}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
