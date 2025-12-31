require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

const SERP_API_KEY = process.env.SERP_API_KEY;
const API_BASE = "http://localhost:5000";

/* -------------------------------
   Google Search using SerpAPI
-------------------------------- */
async function googleSearch(query) {
  const res = await axios.get("https://serpapi.com/search.json", {
    params: {
      q: query,
      engine: "google",
      api_key: SERP_API_KEY
    }
  });
  return res.data.organic_results || [];
}

/* -------------------------------
   Scrape article content
-------------------------------- */
async function scrapeArticleContent(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      timeout: 15000
    });

    const $ = cheerio.load(res.data);

    let text = $("article").text().trim();

    if (!text || text.length < 200) {
      text = $("p")
        .map((i, el) => $(el).text())
        .get()
        .join("\n");
    }

    return text.slice(0, 2000);
  } catch (err) {
    console.log("Failed to scrape:", url);
    return "";
  }
}

/* -------------------------------
   Generate enhanced article (AI)
-------------------------------- */
async function generateEnhancedArticle(original, ref1, ref2) {
  const prompt = `
You are a professional content editor.

Original Article:
${original}

Reference Article 1:
${ref1}

Reference Article 2:
${ref2}

Instructions:
- Improve structure and readability
- Keep content original
- Add headings and bullet points
- Do NOT copy text directly
- Do NOT mention references inside content

Return only the improved article.
`;

  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "phi3",
    prompt,
    stream: false
  });

  return response.data.response;
}

/* -------------------------------
   Main Phase 2 Logic
-------------------------------- */
async function runPhase2() {
  console.log("Phase 2 started");

  const articles = (await axios.get(`${API_BASE}/articles`)).data;

  for (const article of articles.slice(0, 1)) {
    if (!article.title || article.title === "No title") continue;

    console.log(`\nProcessing: ${article.title}`);

    const searchResults = await googleSearch(article.title);

    const validLinks = searchResults.filter(
      r => r.link && !r.link.includes("beyondchats.com")
    );

    let sourceContents = [];
    let referenceLinks = [];

    for (const result of validLinks) {
      if (sourceContents.length === 2) break;

      const content = await scrapeArticleContent(result.link);
      if (content && content.length > 300) {
        sourceContents.push(content);
        referenceLinks.push(result.link);
      }
    }

    if (sourceContents.length < 2) {
      console.log("Not enough usable reference articles");
      continue;
    }

    console.log("Reference content scraped");

    const enhancedContent = await generateEnhancedArticle(
      article.content || "",
      sourceContents[0],
      sourceContents[1]
    );

    console.log("AI content generated");

    await axios.put(`${API_BASE}/articles/${article._id}`, {
      updatedContent: enhancedContent,
      references: referenceLinks
    });

    console.log("Article updated via API");
  }

  console.log("\nPhase 2 completed");
}

runPhase2();
