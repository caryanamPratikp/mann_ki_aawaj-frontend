import { z } from 'zod';

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(80, 'Full name must not exceed 80 characters')
    .regex(/^[A-Za-z\s]+$/, 'Full name must contain only letters and spaces'),
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  mobileNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number starting with 6-9'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(30, 'Password must not exceed 30 characters'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

// Profile Schema for Edit Profile (Max 200 chars, no min word requirement for quick updates)
export const editProfileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  bio: z
    .string()
    .max(200, 'Bio must not exceed 200 characters')
    .optional()
    .or(z.literal('')),
  avatar: z.string().optional(),
});

// Profile Schema for First-Time Onboarding (Requires 10 words min)
export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username can only contain letters, numbers, dots, and underscores'),
  bio: z
    .string()
    .max(200, 'Bio must not exceed 200 characters')
    .refine((val) => {
      if (!val || val.trim().length === 0) return true;
      const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
      return wordCount >= 10;
    }, 'Bio must contain at least 10 words'),
  avatar: z.string().optional(),
});
