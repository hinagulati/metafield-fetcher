const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Replace with your Shopify Admin API credentials
const ACCESS_TOKEN = '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';
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

app.use(cors()); // Enable CORS for all origins
app.use(express.json());

// Fetch all products and filter by metafield
app.get('/fetch-products/:author', async (req, res) => {
  const author = req.params.author; // e.g., "william-shakespeare"

  try {
    // Step 1: Fetch all products
    const productsResponse = await axios.get(`${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`, {
      headers: { 'X-Shopify-Access-Token': ACCESS_TOKEN },
    });

    const products = productsResponse.data.products;
    const filteredProducts = [];

    // Step 2: Loop through products and fetch their metafields
    for (const product of products) {
      const metafieldsResponse = await axios.get(
        `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${product.id}/metafields.json`,
        { headers: { 'X-Shopify-Access-Token': ACCESS_TOKEN } }
      );

      const metafields = metafieldsResponse.data.metafields;

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
