import express from 'express';
import { request, gql } from 'graphql-request';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

const ACCESS_TOKEN = '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';
const SHOPIFY_GRAPHQL_URL = 'https://k0e2gg-bs.myshopify.com/admin/api/2024-01/graphql.json';

const GET_PRODUCTS_QUERY = gql`
  query getProducts($cursor: String, $author: String!) {
    products(first: 100, after: $cursor, query: $author) {
      edges {
        node {
          id
          title
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                price
                compareAtPrice
              }
            }
          }
          metafields(namespace: "custom", first: 10) {
            edges {
              node {
                key
                value
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

app.get('/fetch-products-by-author/:author', async (req, res) => {
  const author = req.params.author;
  let products = [];
  let cursor = null;

  try {
    do {
      const variables = {
        cursor,
        author: `metafield:custom.author:${author}`,
      };

      const response = await request(
        SHOPIFY_GRAPHQL_URL,
        GET_PRODUCTS_QUERY,
        variables,
        {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        }
      );

      const productEdges = response.products.edges;
      const pageInfo = response.products.pageInfo;

      for (const edge of productEdges) {
        const product = edge.node;

        const authorMetafield = product.metafields.edges.find(
          (mf) => mf.node.key === 'author' && mf.node.value === author
        );

        if (authorMetafield) {
          products.push({
            id: product.id,
            title: product.title,
            image: product.images.edges[0]?.node.src || '',
            price: product.variants.edges[0]?.node.price || '',
            compareAtPrice:
              product.variants.edges[0]?.node.compareAtPrice || '',
          });
        }
      }

      cursor = pageInfo.hasNextPage ? pageInfo.endCursor : null;
    } while (cursor);

    res.json(products);
  } catch (error) {
    console.error('Error fetching products by author:', error);
    res.status(500).json({ error: 'Failed to fetch products by author' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
