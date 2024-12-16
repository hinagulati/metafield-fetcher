// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Enable CORS for frontend

const app = express();
app.use(cors()); // Allow requests from all origins (adjust as needed)
app.use(express.json());

// Replace with your Shopify store's access token and store URL
const ACCESS_TOKEN = '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'; // Replace with your Shopify Admin API Access Token
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

// Route to fetch products by author
app.get('/fetch-products-by-author', async (req, res) => {
  try {
    const author = req.query.author; // Get author from the query parameter
    const productsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`;

    // Fetch products
    const productsResponse = await axios.get(productsUrl, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
    });

    const products = productsResponse.data.products;

    // Filter products by author metafield
    const filteredProducts = [];
    for (const product of products) {
      const metafieldsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${product.id}/metafields.json`;
      const metafieldsResponse = await axios.get(metafieldsUrl, {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
        },
      });

      const metafields = metafieldsResponse.data.metafields;
      const authorMetafield = metafields.find(mf => mf.key === 'author' && mf.value === author);

      if (authorMetafield) {
        filteredProducts.push({
          id: product.id,
          title: product.title,
          image: product.images[0]?.src, // Assuming the first image is the main image
          price: product.variants[0]?.price,
          compare_at_price: product.variants[0]?.compare_at_price,
        });
      }
    }

    // Send filtered products as response
    res.json({ products: filteredProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Error fetching products');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
