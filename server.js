const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Replace with your Shopify store's access token and store URL
const ACCESS_TOKEN = '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'; // Replace with your Shopify Admin API Access Token
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

// Enable CORS for frontend
app.use(cors({
  origin: 'https://peacockbooks.com', // Replace with your store's domain
}));

app.use(express.json());

// Route to fetch products by author metafield
app.get('/fetch-products/:author', async (req, res) => {
  const author = req.params.author; // e.g., "william-shakespeare"

  try {
    // Shopify Admin API endpoint for products
    const productsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`;

    const response = await axios.get(productsUrl, {
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        // Filter products by metafields
        'metafield.namespace': 'custom', // Replace with your metafield namespace
        'metafield.key': 'author',      // Replace with your metafield key
        'metafield.value': author,      // Filter products with matching author value
      },
    });

    // Extract relevant product details
    const products = response.data.products.map(product => ({
      id: product.id,
      title: product.title,
      image: product.image?.src || '', // Get product image
      price: product.variants[0]?.price || '', // Get price
      compareAtPrice: product.variants[0]?.compare_at_price || '', // Compare price
    }));

    res.json(products); // Return products as JSON
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    res.status(500).send('Error fetching products');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
