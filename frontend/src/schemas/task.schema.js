import { z } from 'zod';
import { TASK_STATUS } from '../constants/taskStatus.js';

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Task title must be at least 5 characters'),
  description: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length >= 20, {
      message: 'Description must be at least 20 characters if provided',
    }),
  assignedTo: z
    .string()
    .min(1, 'Please select a project member to assign'),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Task title must be at least 5 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .optional(),
  status: z.enum([TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.DONE]),
  assignedTo: z.string().optional(),
});

export const subtaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, 'Subtask title must be at least 5 characters'),
});
