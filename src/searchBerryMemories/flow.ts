import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import {
  applicationDefault,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { onCallGenkit } from 'firebase-functions/https';
import { logger } from 'firebase-functions/v2';
import { Document } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';
import { BerryMemory, BerryMemorySchema } from '../schema';
import { berryMemoriesRetriever } from './retriever';

enableFirebaseTelemetry();

function initializeFirebase() {
  if (!getApps().length) {
    return initializeApp({ credential: applicationDefault() });
  }

  return getApp();
}

initializeFirebase();

export const searchBerryMemoriesInputSchema = z.object({
  query: z.string(),
  limit: z.number().optional().default(5),
  cid: z.string(),
  uid: z.string(),
});

export const searchBerryMemoriesOutputSchema = z.array(BerryMemorySchema);

export const searchBerryMemoriesFlow = ai.defineFlow(
  {
    name: 'searchBerryMemories',
    inputSchema: searchBerryMemoriesInputSchema,
    outputSchema: searchBerryMemoriesOutputSchema,
  },
  async ({ query, limit, cid, uid }) => {
    logger.info('Searching for memories:', {
      query,
      limit,
      cid,
      uid,
    });

    const memories = await ai.run(
      'Retrieve matching memories',
      { query },
      async () => {
        const docs = await ai.retrieve({
          retriever: berryMemoriesRetriever,
          query,
        });

        if (docs.length === 0) {
          logger.info('No memories found');
          return [];
        }

        logger.info('Retrieved memories:', { docs, structuredData: true });

        return docs.map(mapDocToMemory);
      }
    );

    logger.info('Memories:', { memories, structuredData: true });

    return memories;
  }
);

export const searchBerryMemories = onCallGenkit(searchBerryMemoriesFlow);

const mapDocToMemory = (doc: Document) => {
  const data = doc.toJSON();
  const metadata = data.metadata ?? {};
  const type = metadata.type as 'text' | 'image' | 'video' | 'audio';

  const baseMemory = {
    type,
    uid: metadata.uid as string,
    cid: metadata.cid as string,
    content: data.content[0].text as string,
    multimodalEmbedding001Status: metadata.multimodalEmbedding001Status as
      | 'pending'
      | 'success'
      | 'error',
  };

  if (type === 'text') {
    return baseMemory as BerryMemory;
  }

  return {
    ...baseMemory,
    media: metadata.media as {
      storagePath: string;
      contentType: string;
    },
  } as BerryMemory;
};
