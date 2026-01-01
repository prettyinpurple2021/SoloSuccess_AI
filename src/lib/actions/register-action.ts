'use server';

import { signIn } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const RegisterSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.string().optional().refine((val) => val === 'on', {
    message: "You must agree to the terms and conditions"
  }),
  dateOfBirth: z.string().refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  }, { message: "You must be 18+ to register." }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function register(prevState: any, formData: FormData) {
  console.log('Register action (new file) triggered');
  const rawData = Object.fromEntries(formData);
  const validatedFields = RegisterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0]?.message || 'Invalid fields.';
    return {
      error: firstError,
    };
  }

  const { firstName, lastName, email, password, dateOfBirth } = validatedFields.data;
  const fullName = `${firstName} ${lastName}`.trim();

  const existingUserResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const existingUser = existingUserResult[0];

  if (existingUser) {
    return {
      error: 'Email already registered.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      full_name: fullName,
      name: fullName,
      username: email.split('@')[0],
      role: 'user',
      date_of_birth: new Date(dateOfBirth),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return {
      error: 'Database error: Failed to create user.',
    };
  }

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
  } catch (error) {
    if ((error as any).message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Sign in error during registration:', error);
    return {
      error: 'Account created, but auto-login failed. Please sign in manually.',
    };
  }
}
