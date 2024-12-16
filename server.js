const express = require('express');
const axios = require('axios');
const cors = require('cors'); // For CORS
const app = express();

// Shopify credentials
const ACCESS_TOKEN = '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';
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

// Middleware
app.use(cors());
app.use(express.json());

// Fetch all products filtered by author metafield
app.get('/fetch-products-by-author/:author', async (req, res) => {
  const author = req.params.author; // e.g., "william-shakespeare"

  try {
    // Get all products (paginated)
    let products = [];
    let nextPageUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json?limit=250`;

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl, {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
        },
      });
      products = products.concat(response.data.products);
      nextPageUrl = response.headers['link']?.includes('rel="next"')
        ? response.headers['link'].match(/<(.*?)>; rel="next"/)?.[1]
        : null;
    }

    // Filter products by metafield value
    const filteredProducts = [];
    for (const product of products) {
      const metafieldsResponse = await axios.get(
        `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${product.id}/metafields.json`,
        {
          headers: {
            'X-Shopify-Access-Token': ACCESS_TOKEN,
          },
        }
      );

      const metafields = metafieldsResponse.data.metafields || [];
      const authorMetafield = metafields.find(
        (mf) => mf.namespace === 'custom' && mf.key === 'author' && mf.value === author
      );

      if (authorMetafield) {
        filteredProducts.push({
          id: product.id,
          title: product.title,
          image: product.images[0]?.src || '',
          price: product.variants[0]?.price || '',
          compare_at_price: product.variants[0]?.compare_at_price || '',
        });
      }
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('Error fetching products by author:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch products by author' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});