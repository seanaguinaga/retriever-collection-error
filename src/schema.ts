import { z } from "zod";

export const MemoryEmbedStatusSchema = z.union([
  z.literal("pending"),
  z.literal("success"),
  z.literal("error"),
]);
export type MemoryEmbedStatus = z.infer<typeof MemoryEmbedStatusSchema>;

export const MemoryTypeSchema = z.union([
  z.literal("text"),
  z.literal("image"),
  z.literal("video"),
  z.literal("audio"),
]);
export type MemoryType = z.infer<typeof MemoryTypeSchema>;

const MediaSchema = z.object({
  storagePath: z.string(),
  contentType: z.string(),
});

export const TextBerryMemorySchema = z.object({
  uid: z.string(),
  cid: z.string(),
  type: z.literal("text"),
  content: z.string(),
  multimodalEmbedding001: z.array(z.number()).optional(),
  multimodalEmbedding001Status: MemoryEmbedStatusSchema,
});

export const ImageBerryMemorySchema = z.object({
  uid: z.string(),
  cid: z.string(),
  type: z.literal("image"),
  media: MediaSchema,
  multimodalEmbedding001: z.array(z.number()).optional(),
  multimodalEmbedding001Status: MemoryEmbedStatusSchema,
});

export const AudioBerryMemorySchema = z.object({
  uid: z.string(),
  cid: z.string(),
  type: z.literal("audio"),
  media: MediaSchema,
  multimodalEmbedding001: z.array(z.number()).optional(),
  multimodalEmbedding001Status: MemoryEmbedStatusSchema,
});

export const VideoBerryMemorySchema = z.object({
  uid: z.string(),
  cid: z.string(),
  type: z.literal("video"),
  media: MediaSchema,
  multimodalEmbedding001: z.array(z.number()).optional(),
  multimodalEmbedding001Status: MemoryEmbedStatusSchema,
});

export const BerryMemorySchema = z.union([
  TextBerryMemorySchema,
  ImageBerryMemorySchema,
  AudioBerryMemorySchema,
  VideoBerryMemorySchema,
]);

export type BerryMemory = z.infer<typeof BerryMemorySchema>;
