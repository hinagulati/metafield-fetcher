const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Replace with your Shopify store's access token and store URL
const ACCESS_TOKEN = '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'; // Replace with your access token
const SHOPIFY_STORE_URL = 'https://k0e2gg-bs.myshopify.com'; // Replace with your Shopify store URL

app.use(cors());
app.use(express.json());

// Endpoint to fetch products filtered by metafield author
app.get('/fetch-products-by-author/:author', async (req, res) => {
  const authorName = req.params.author; // Capture the author name from the URL

  try {
    // Fetch all products
    const productsResponse = await axios.get(`${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json`, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN
      }
    });

    const products = productsResponse.data.products;
    
    // Filter products by metafield author
    const filteredProducts = [];

    for (let product of products) {
      const metafieldsResponse = await axios.get(`${SHOPIFY_STORE_URL}/admin/api/2024-01/products/${product.id}/metafields.json`, {
        headers: {
          'X-Shopify-Access-Token': ACCESS_TOKEN
        }
      });

      // Check if the product has the 'author' metafield matching the provided author name
      const authorMetafield = metafieldsResponse.data.metafields.find(
        metafield => metafield.namespace === 'author' && metafield.value === authorName
      );
console.log(authorMetafield );
      // If the metafield matches, add the product to the filtered list
      if (authorMetafield) {
        filteredProducts.push({
          id: product.id,
          title: product.title,
          image: product.images.length > 0 ? product.images[0].src : null,
          price: product.variants[0].price, // Assuming the first variant
          compareAtPrice: product.variants[0].compare_at_price
        });
      }
    }
console.log(filteredProducts);
    // Return the filtered products
    res.json(filteredProducts);

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
