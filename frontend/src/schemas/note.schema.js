import { z } from 'zod';

export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Note title must be at least 5 characters')
    .max(100, 'Note title cannot exceed 100 characters'),
  content: z
    .string()
    .trim()
    .min(10, 'Note content must be at least 10 characters')
    .max(5000, 'Note content cannot exceed 5000 characters'),
});
