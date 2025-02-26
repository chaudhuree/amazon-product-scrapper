const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors({ origin: ['http://localhost:5173', 'https://amazon-product-scrapper.vercel.app','http://localhost:4000'] }));

// Add security headers middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https:; font-src 'self' data: https:;"
  );
  next();
});

// Endpoint to scrape product data from a URL
app.post('/scrape-product', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // Fetch the HTML content of the provided URL
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Initialize an object to hold all extracted data
    const product = {};

    // Extract product name (trying multiple selectors)
    product.name = $('#productTitle').text().trim() || $('h1.a-size-large.a-spacing-none').text().trim() || $('#productTitle').text().trim() || null;

    // Extract price, including different potential price formats
    product.price = $('#corePriceDisplay_desktop .a-price .a-offscreen').text() || $('#priceblock_ourprice').text().trim() || $('#apex_offerDisplay_desktop .a-price .a-offscreen').text().trim() || null;

    //Extract description.
    product.description = $('#feature-bullets ul').text().trim() || $('#productDescription').text().trim() || null;

    // Extract image URL
    let landingImageUrls;
    const landingImageData = $('#landingImage').data('a-dynamic-image');
    if(landingImageData) {
      landingImageUrls = Object.keys(landingImageData);
    }

    if (landingImageUrls && landingImageUrls.length > 0) {
       product.image = landingImageUrls[landingImageUrls.length - 1]; // Get the last one, assumed to be the largest.
    } else {
        product.image = $('#landingImage').attr('src') || null;
    }

     // Scrape all bullet points from "About this item" section
    const bullets = [];
    $('#feature-bullets ul li span.a-list-item').each((i, el) => {
      bullets.push($(el).text().trim());
    });
    product.bullets = bullets;

    // Scrape other details (manufacturer, ASIN, etc.)
    const productDetails = {};
    $('#detailBullets_feature_div .a-list-item').each((i, el) => {
      const text = $(el).text().trim();
      const parts = text.split(':'); // Simple split, adjust if needed
      if (parts.length === 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        productDetails[key] = value;
      }
    });
   product.productDetails = productDetails;


    // Attempt to scrape Breadcrumbs
    const breadcrumbs = [];
    $('#wayfinding-breadcrumbs_container ul li a').each((i, el) => {
        breadcrumbs.push($(el).text().trim());
    });
    product.breadcrumbs = breadcrumbs;

    // Customer reviews
    product.rating = $('#averageCustomerReviews_feature_div #averageCustomerReviews .a-size-base.a-color-base').text().trim();
    product.ratingCount = $('#averageCustomerReviews_feature_div #averageCustomerReviews #acrCustomerReviewText').text().trim();

    // Include more details here

    console.log("Successfully scraped product data:");
    console.log(product);
    return res.status(200).json(product);

  } catch (error) {
    console.error('Error scraping product:', error);
    res.status(500).json({ error: 'Failed to fetch product data.' });
  }
});


// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, 'client/dist'), {
  maxAge: '1y',
  etag: false
}));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Start the Express server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
