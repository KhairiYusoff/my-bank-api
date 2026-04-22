# MongoDB Atlas Vector Search

> Docs: https://www.mongodb.com/docs/atlas/atlas-vector-search/create-index/

## Requirements

- MongoDB Atlas cluster (M0 free tier supported)
- MongoDB Node.js driver **v6.6.0+** for `createSearchIndex()` API
- Atlas Vector Search is enabled by default on all clusters

## Install

```bash
npm install mongodb   # ensure v6.6.0 or higher
```

Check version:
```bash
node -e "console.log(require('mongodb/package.json').version)"
```

---

## Index Definition

### JSON (for Atlas UI or API)

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 1024,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    }
  ]
}
```

- `numDimensions`: **1024** — matches `embed-english-v3.0` from Cohere
- `similarity`: `cosine` — best for normalized text embeddings
- `indexingMethod`: `hnsw` (default) — approximate nearest neighbor

### Create via Node.js Driver

```js
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const collection = client.db('mybank').collection('knowledge');

// Run once as a migration/startup script
async function createVectorIndex() {
  const existingIndexes = await collection.listSearchIndexes().toArray();
  const alreadyExists = existingIndexes.some((i) => i.name === 'vector_index');

  if (alreadyExists) {
    console.log('Vector index already exists — skipping');
    return;
  }

  await collection.createSearchIndex({
    name: 'vector_index',
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'embedding',
          numDimensions: 1024,
          similarity: 'cosine',
        },
        {
          type: 'filter',
          path: 'userId',
        },
      ],
    },
  });

  console.log('Vector index created');
}
```

---

## Query — $vectorSearch Aggregation Pipeline

```js
async function searchSimilar(queryVector, userId, topK = 3) {
  const pipeline = [
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector,           // float[] — 1024-dim from Cohere embedQuery()
        numCandidates: 50,     // candidates to scan before selecting topK
        limit: topK,
        filter: { userId },    // REQUIRED — isolate per-user data
      },
    },
    {
      $project: {
        _id: 0,
        text: 1,
        source: 1,
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];

  return collection.aggregate(pipeline).toArray();
}
```

---

## Document Schema (knowledge collection)

```js
{
  userId: ObjectId,          // for per-user filtering
  text: String,              // the chunk text
  embedding: [Number],       // 1024-dim float array from Cohere
  source: String,            // 'faq' | 'product' | 'account-guide'
  metadata: {
    chunkIndex: Number,      // optional: position in original doc
    docId: String,           // optional: reference to source doc
  },
  createdAt: Date,
}
```

Mongoose Schema:
```js
const knowledgeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
  source: { type: String, required: true },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});
```

---

## Free Tier Limits (M0)

- Max **3** vector search indexes per cluster
- Max **2048** dimensions (we use 1024 — well within limit)
- Standard Atlas storage and query limits apply

---

## Key Rules

- **Always filter by `userId`** — never return documents from other users
- Index name must be `'vector_index'` — keep consistent across codebase
- Run `createSearchIndex` only once — check for existing index first (see above)
- Driver v6.6.0+ is required for `createSearchIndex()` — verify before deploying
- `numCandidates` should be at least 10x `limit` for good recall quality
- Add the `filter` field in the index definition, not just the query — both are required
