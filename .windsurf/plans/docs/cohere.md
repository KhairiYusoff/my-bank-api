# Cohere Embeddings

> Docs: https://docs.cohere.com/v2/docs/embeddings
> API Ref: https://docs.cohere.com/v2/reference/embed

## Install

```bash
npm install cohere-ai
```

## Environment

```env
COHERE_API_KEY=xxxxxxxxxxxx
```

---

## Models

| Model | Dimensions | Max Tokens | Use case |
|---|---|---|---|
| `embed-english-v3.0` | **1024** (fixed) | 512 | English only — production stable |
| `embed-multilingual-v3.0` | **1024** (fixed) | 512 | 100+ languages |
| `embed-v4.0` | 256/512/1024/1536 | 128k | Best overall, multilingual, latest |

**Recommended for MyBank Phase 2:** `embed-english-v3.0`
- Fixed 1024 dimensions — matches Atlas Vector Search index
- No need to set `output_dimension`
- Stable API, production-tested

---

## Usage — Embed Documents (for storage)

```js
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

async function embedDocuments(texts) {
  // texts: string[] — max 96 per call
  const response = await cohere.v2.embed({
    model: 'embed-english-v3.0',
    texts,
    inputType: 'search_document',  // MUST be 'search_document' for stored docs
    embeddingTypes: ['float'],
  });

  return response.embeddings.float; // float[][] — array of 1024-dim vectors
}
```

## Usage — Embed Query (for searching)

```js
async function embedQuery(query) {
  const response = await cohere.v2.embed({
    model: 'embed-english-v3.0',
    texts: [query],
    inputType: 'search_query',     // MUST be 'search_query' for user queries
    embeddingTypes: ['float'],
  });

  return response.embeddings.float[0]; // float[] — single 1024-dim vector
}
```

---

## CRITICAL: `inputType` Rules

| Scenario | `inputType` |
|---|---|
| Embedding content to store in vector DB | `'search_document'` |
| Embedding a user query to search with | `'search_query'` |
| Text classification tasks | `'classification'` |
| Clustering tasks | `'clustering'` |

> **Mixing these will degrade search quality significantly.**

---

## Full RAG Embed + Store Pattern

```js
// services/embedService.js
import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY });

// Ingest chunks into Atlas
export async function ingestChunks(chunks, userId, collection) {
  // Batch in groups of 96 (API limit)
  const BATCH_SIZE = 96;
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.text);

    const response = await cohere.v2.embed({
      model: 'embed-english-v3.0',
      texts,
      inputType: 'search_document',
      embeddingTypes: ['float'],
    });

    const docs = batch.map((chunk, j) => ({
      userId,
      text: chunk.text,
      embedding: response.embeddings.float[j],
      source: chunk.source,
      createdAt: new Date(),
    }));

    await collection.insertMany(docs);
  }
}

// Retrieve relevant docs for a user query
export async function retrieveContext(query, userId, collection, topK = 3) {
  // 1. Embed the query
  const response = await cohere.v2.embed({
    model: 'embed-english-v3.0',
    texts: [query],
    inputType: 'search_query',
    embeddingTypes: ['float'],
  });
  const queryVector = response.embeddings.float[0];

  // 2. Atlas vector search filtered by userId
  const results = await collection.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector,
        numCandidates: 50,
        limit: topK,
        filter: { userId },
      },
    },
    {
      $project: { _id: 0, text: 1, source: 1, score: { $meta: 'vectorSearchScore' } },
    },
  ]).toArray();

  return results.map((r) => r.text).join('\n\n');
}
```

---

## Rate Limits

| Plan | Calls/month | Notes |
|---|---|---|
| Trial | 1,000 | Free, limited |
| Production | Unlimited | Pay-as-you-go (~$0.10/1M tokens) |

---

## Key Rules

- Always specify `embeddingTypes: ['float']` explicitly — default may vary
- `embed-english-v3.0` always returns 1024 dimensions — no `output_dimension` needed
- For `embed-v4.0`, set `output_dimension: 1024` to match Atlas index
- Batch up to **96 texts** per call to minimize API calls (API hard limit)
- Server-side only — never expose `COHERE_API_KEY` to client
- Never send PII in embedding requests — embed product descriptions and FAQs only
