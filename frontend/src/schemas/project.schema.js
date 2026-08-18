import { z } from 'zod';
import { ROLES } from '../constants/roles.js';

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, 'Project name must be at least 5 characters'),
  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters'),
});

export const addMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Invalid email address format'),
  role: z.enum([ROLES.ADMIN, ROLES.PROJECT_ADMIN, ROLES.MEMBER], {
    required_error: 'Please select a valid user role',
  }),
});
