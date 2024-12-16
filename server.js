const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Replace with your Shopify store's access token and store URL
const ACCESS_TOKEN = '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'; // Replace with your Shopify Admin API Access Token
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com';

// Helper function to delay execution (throttle requests)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Route to fetch products by author
app.get('/fetch-products-by-author', async (req, res) => {
  try {
    const author = req.query.author;
    const productsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json?limit=250`;

    // Fetch all products
    const productsResponse = await axios.get(productsUrl, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
      },
    });

    const products = productsResponse.data.products;

    const filteredProducts = [];
    for (const product of products) {
      const metafieldsUrl = `${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${product.id}/metafields.json`;

      // Delay request to avoid hitting API limits
      await delay(500); // Add a 500ms delay between requests (2 requests per second)

      const metafieldsResponse = await axios.get(metafieldsUrl, {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN,
        },
      });

      const metafields = metafieldsResponse.data.metafields;
      
       console.log(`Metafields for product ${product.id}:`, metafields); // Log metafields

      const authorMetafield = metafields.find(
        (mf) => mf.key === 'author' && mf.value === author
      );

      if (authorMetafield) {
        filteredProducts.push({
          id: product.id,
          title: product.title,
          image: product.images[0]?.src,
          price: product.variants[0]?.price,
          compare_at_price: product.variants[0]?.compare_at_price,
        });
      }
    }
 console.log('Filtered Products:', filteredProducts); // Log final filtered products
    res.json({ products: filteredProducts });
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
