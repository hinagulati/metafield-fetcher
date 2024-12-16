const express = require('express');
const axios = require('axios');
const cors = require('cors'); // For CORS
const app = express();

// Replace with your Shopify Admin API Access Token and store URL
const ACCESS_TOKEN = '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';
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

// Middleware
app.use(express.json());
app.use(cors()); // Allow frontend requests

// Fetch metafields for a specific product
app.get('/fetch-metafields/:productId', async (req, res) => {
  const { productId } = req.params;
  const metafieldsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${productId}/metafields.json`;

  try {
    const response = await axios.get(metafieldsUrl, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
    });
    res.json(response.data); // Send metafields back to frontend
  } catch (error) {
    console.error('Error fetching metafields:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch metafields' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
