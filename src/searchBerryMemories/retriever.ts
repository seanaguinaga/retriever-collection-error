import { defineFirestoreRetriever } from '@genkit-ai/firebase';
import { multimodalEmbedding001 } from '@genkit-ai/vertexai';
import {
  applicationDefault,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { ai } from '../genkit';

function initializeFirebase() {
  if (!getApps().length) {
    return initializeApp({ credential: applicationDefault() });
  }

  return getApp();
}

const firestore = getFirestore(initializeFirebase());

export const berryMemoriesRetriever = defineFirestoreRetriever(ai, {
  name: 'berryMemoriesRetriever',
  firestore,
  collection: 'berryMemories',
  contentField: doc => {
    const data = doc.data();
    return data.type === 'text'
      ? data.content
      : `[${data.type} memory] ${data.media.storagePath}`;
  },
  vectorField: 'multimodalEmbedding001',
  embedder: multimodalEmbedding001,
  distanceMeasure: 'COSINE',
  distanceThreshold: 0.8,
  metadataFields: ['type', 'uid', 'cid', 'media'],
});
