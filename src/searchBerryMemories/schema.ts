import { z } from 'genkit';
import { BerryMemorySchema } from '../schema';

export const searchBerryMemoriesInputSchema = z.object({
  query: z.string(),
  limit: z.number().optional(),
});

export const searchBerryMemoriesOutputSchema = z.array(BerryMemorySchema);
