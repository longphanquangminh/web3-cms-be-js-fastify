// Import the framework and instantiate it
const fastify = require('fastify')({ logger: true });
const { Permit } = require('permitio');
const dotenv = require('dotenv');
const { algoliasearch } = require('algoliasearch');

dotenv.config();

const permit = new Permit({
  pdp: 'https://cloudpdp.api.permit.io',
  token: process.env.PERMIT_API_KEY,
});

const ALGOLIA_APPLICATION_ID = process.env.ALGOLIA_APPLICATION_ID;
const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY;

const algoliaClient = algoliasearch(ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY);

// Declare a route
fastify.get('/content', async function handler(request, reply) {
  const { value = '', page = 1, size = 10 } = request.query || {};
  const finalValue = value?.trim()?.toLowerCase();
  const pageData = page - 1;
  const response = await algoliaClient.search({
    requests: [
      {
        indexName: 'content_index',
        hitsPerPage: size,
        page: pageData,
        query: finalValue,
      },
    ],
  });

  reply.send(response.results[0].hits);
});

fastify.post('/content', async function handler(request, reply) {
  const { value = '', page = 1 } = request.query || {};
  const finalValue = value?.trim()?.toLowerCase();
  const pageData = page - 1;
  const response = await algoliaClient.search({
    requests: [{ indexName: 'content_index', hitsPerPage: 50, page: pageData, query: finalValue }],
  });

  reply.send(response.results[0].hits);
});

// Run the server!
fastify.listen({ port: 3000 }, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
