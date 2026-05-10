import { defineCollection, z } from 'astro:content';

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  section: z.string(),
  sourcePath: z.string(),
  sourceUrl: z.string().url(),
  sourceRepo: z.string(),
  syncedAt: z.string(),
  order: z.number().optional(),
  draft: z.boolean().optional().default(false)
});

export const collections = {
  stages: defineCollection({ schema: baseSchema }),
  tracks: defineCollection({ schema: baseSchema }),
  branches: defineCollection({ schema: baseSchema }),
  resources: defineCollection({ schema: baseSchema }),
  walkthroughs: defineCollection({ schema: baseSchema })
};
