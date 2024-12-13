const express = require('express');
const axios = require('axios');
const app = express();

// Replace with your Shopify store's access token and store URL
const ACCESS_TOKEN = 'c42fa43efd78ee9864f8beb932f1cb05'; // Replace with your Shopify Admin API Access Token
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

app.use(express.json());

// Route to fetch metafields for a product
app.get('/fetch-metafields/:productId', (req, res) => {
  const productId = req.params.productId;

  // Shopify Admin API endpoint for metafields
  const metafieldsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${productId}/metafields.json`;

  axios.get(metafieldsUrl, {
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
    },
  })
    .then(response => {
      res.json(response.data); // Return metafields as JSON
    })
    .catch(error => {
      console.error('Error fetching metafields:', error.response?.data || error.message);
      res.status(500).send('Error fetching metafields');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
