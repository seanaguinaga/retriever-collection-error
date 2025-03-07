import vertexAI, { multimodalEmbedding001 } from '@genkit-ai/vertexai';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { logger } from 'firebase-functions/v2';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { genkit } from 'genkit/beta';
import { BerryMemory } from '../schema';

if (getApps().length === 0) {
  initializeApp();
}

const storage = getStorage();

const ai = genkit({
  plugins: [vertexAI()],
});

export const onBerryMemoryCreated = onDocumentCreated(
  `berryMemories/{berryMemoryId}`,
  async event => {
    const berryMemoryId = event.params.berryMemoryId;
    const snapshot = event.data;

    if (!snapshot) {
      logger.warn('No data associated with the event');
      return;
    }
    const berryMemory = snapshot.data() as BerryMemory;

    switch (berryMemory.type) {
      case 'text':
        logger.info('Berry memory is a text');
        {
          const embedding = await generateEmbedding(berryMemory);
          await updateBerryMemory({ berryMemoryId, embedding });
        }
        break;
      case 'image':
      case 'audio':
      case 'video':
        logger.info('Berry memory is an image, audio, or video');
        {
          const embedding = await generateEmbedding(berryMemory);
          await updateBerryMemory({ berryMemoryId, embedding });
        }
        break;
      default:
        logger.info('Berry memory ID', { berryMemoryId });
        logger.info('Berry memory', { berryMemory, structuredData: true });
        throw new Error('Unknown berry memory type');
    }
  }
);

async function getGCSPath(storagePath: string): Promise<string> {
  const bucket = storage.bucket().name;
  const url = `gs://${bucket}/${storagePath}`;

  return url;
}

async function getEmbedContent(memory: BerryMemory) {
  switch (memory.type) {
    case 'text':
      return { text: memory.content };
    case 'image':
    case 'video':
    case 'audio':
      return {
        media: {
          url: await getGCSPath(memory.media.storagePath),
          contentType: memory.media.contentType,
        },
      };
    default:
      throw new Error(`Unsupported memory type: ${JSON.stringify(memory)}`);
  }
}

async function generateEmbedding(memory: BerryMemory) {
  const embedContent = await getEmbedContent(memory);
  const result = await ai.embed({
    embedder: multimodalEmbedding001,
    content: { content: [embedContent] },
  });
  return result[0].embedding;
}

async function updateBerryMemory({
  berryMemoryId,
  embedding,
}: {
  berryMemoryId: string;
  embedding: number[];
}) {
  const db = getFirestore();
  const berryMemoryRef = db.collection('berryMemories').doc(berryMemoryId);

  await berryMemoryRef.update({
    multimodalEmbedding001: embedding,
    multimodalEmbedding001Status: 'success',
  });
}
