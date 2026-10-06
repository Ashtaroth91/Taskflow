import { z } from 'zod';

export const noteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Note content is required')
    .max(5000, 'Note content cannot exceed 5000 characters'),
});
