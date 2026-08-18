import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.');

export const loginSchema = z.object({
  identity: z.string().trim().min(1, 'Email or username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(5, 'Username must be at least 5 characters long.')
      .max(40, 'Username must be at most 40 characters long.'),
    email: z.string().trim().email('Enter a valid email address.'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match.',
    path: ['confirmNewPassword'],
  });

export const toLoginCredentials = ({ identity, password }) => {
  const normalizedIdentity = identity.trim().toLowerCase();

  return normalizedIdentity.includes('@')
    ? { email: normalizedIdentity, password }
    : { username: normalizedIdentity, password };
};
