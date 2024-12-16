const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Replace with your Shopify Admin API credentials
const ACCESS_TOKEN = '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';
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

app.use(cors()); // Enable CORS for all origins
app.use(express.json());

const RATE_LIMIT_DELAY = 500; // 500ms delay between requests (2 calls/sec limit)

// Function to fetch products
async function fetchProducts() {
  const productsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`;
  const response = await axios.get(productsUrl, {
    headers: { 'X-Shopify-Access-Token': ACCESS_TOKEN },
  });
  return response.data.products;
}

// Function to fetch metafields for a specific product
async function fetchMetafields(productId) {
  const metafieldsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${productId}/metafields.json`;
  const response = await axios.get(metafieldsUrl, {
    headers: { 'X-Shopify-Access-Token': ACCESS_TOKEN },
  });
  return response.data.metafields;
}

// Route to fetch products for a specific author
app.get('/fetch-products/:author', async (req, res) => {
  const author = req.params.author; // e.g., "william-shakespeare"

  try {
    // Step 1: Fetch all products
    const products = await fetchProducts();
    const filteredProducts = [];

    // Step 2: Process products one by one (with rate-limiting)
    for (const product of products) {
      // Introduce delay to stay within rate limits
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY));

      const metafields = await fetchMetafields(product.id);

      // Check if the product's metafields match the author
      const authorMetafield = metafields.find(
        (mf) => mf.namespace === 'custom' && mf.key === 'author' && mf.value === author
      );

      if (authorMetafield) {
        filteredProducts.push({
          id: product.id,
          title: product.title,
          image: product.image?.src || '',
          price: product.variants[0]?.price || '',
          compareAtPrice: product.variants[0]?.compare_at_price || '',
        });
      }
    }

    res.json(filteredProducts); // Send filtered products
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data || 'Internal Server Error',
    });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
