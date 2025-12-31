const axios = require("axios");
const cheerio = require("cheerio");

require("../db"); // connect database
const Article = require("../models/Article");

async function scrapeBlog() {

  console.log("Opening blog page...");

  const response = await axios.get("https://beyondchats.com/blogs/");
  const html = response.data;

  const $ = cheerio.load(html);

  const links = [];

  $("a").each((i, element) => {
    const link = $(element).attr("href");
    if (link && link.startsWith("/blogs/")) {
  links.push("https://beyondchats.com" + link);
}

  });

  const uniqueLinks = [...new Set(links)];
  const oldestFive = uniqueLinks.slice(-5);

  console.log("Found articles:", oldestFive.length);

  for (const url of oldestFive) {
    const articlePage = await axios.get(url);
    const $$ = cheerio.load(articlePage.data);

    const title =
  $$("h1").first().text().trim() ||
  $$("title").text().trim() ||
  "No title";


    const content = $$("article").text().trim();

    await Article.create({
      title,
      content,
      url
    });

    console.log("Saved:", title);
  }

  console.log("Scraping completed!");
}

scrapeBlog();
