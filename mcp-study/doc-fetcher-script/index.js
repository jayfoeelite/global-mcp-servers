const axios = require('axios');
const cheerio = require('cheerio');

// The Brave Search API key from your settings
const BRAVE_API_KEY = "BSAgFFoQcVVFuYIiBmjl9DIgUsuXiBb";

async function getDocs(libraryName) {
  if (!libraryName) {
    console.error("Error: Library name is required.");
    process.exit(1);
  }

  try {
    // 1. Search for the library's documentation using the Brave Search API
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
      `${libraryName} documentation`
    )}`;
    
    const searchResponse = await axios.get(searchUrl, {
      headers: {
        "X-Subscription-Token": BRAVE_API_KEY,
        "Accept": "application/json",
      },
    });

    const docUrl = searchResponse.data.web?.results[0]?.url;

    if (!docUrl) {
      console.error("Error: Could not find documentation URL from Brave Search API.");
      process.exit(1);
    }

    // 2. Fetch the documentation page
    const docResponse = await axios.get(docUrl);
    const $doc = cheerio.load(docResponse.data);

    // 3. Scrape and clean the text content
    $doc("script, style, nav, footer, header, [role='navigation'], [role='banner'], [role='contentinfo']").remove();
    const textContent = $doc("body").text().replace(/\s\s+/g, ' ').trim();

    console.log(textContent);
  } catch (error) {
    let errorMessage = error.message;
    if (error.response) {
      errorMessage = `API Error: ${error.response.status} ${JSON.stringify(error.response.data)}`;
    }
    console.error(`Error fetching documentation: ${errorMessage}`);
    process.exit(1);
  }
}

const libraryName = process.argv[2];
getDocs(libraryName);
