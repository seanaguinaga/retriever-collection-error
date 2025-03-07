import vertexAI from '@genkit-ai/vertexai';
import { genkit } from 'genkit/beta';

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: 'sandbox-e35ab',
      location: 'us-central1',
    }),
  ],
});
