import { z } from 'zod';

// Shared password schema requiring min 8 chars, 1 uppercase, 1 number, 1 special character
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

// Phone number regex accommodating international and local standard formats
const phoneRegex = /^[+]?[\d\s().-]{7,25}$/;

// Patient Registration Schema
export const patientRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full Name must be at least 2 characters.')
      .max(100, 'Full Name cannot exceed 100 characters.'),
    email: z
      .string()
      .trim()
      .email('Please enter a valid email address.')
      .max(255, 'Email cannot exceed 255 characters.'),
    phoneNumber: z
      .string()
      .trim()
      .min(7, 'Please enter a valid phone number.')
      .regex(phoneRegex, 'Invalid phone number format (e.g., +1 234-567-8900).')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

// Doctor Registration Schema
export const doctorRegisterSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full Name must be at least 2 characters.')
      .max(100, 'Full Name cannot exceed 100 characters.'),
    email: z
      .string()
      .trim()
      .email('Please enter a valid professional email address.')
      .max(255, 'Email cannot exceed 255 characters.'),
    phoneNumber: z
      .string()
      .trim()
      .min(7, 'Please enter a valid contact phone number.')
      .regex(phoneRegex, 'Invalid phone number format.'),
    medicalSpeciality: z
      .string()
      .trim()
      .min(1, 'Please select your medical speciality.'),
    registrationNumber: z
      .string()
      .trim()
      .min(3, 'Registration number must be at least 3 characters.')
      .max(50, 'Registration number cannot exceed 50 characters.'),
    clinicName: z
      .string()
      .trim()
      .min(2, 'Clinic/Hospital name must be at least 2 characters.')
      .max(150, 'Clinic name cannot exceed 150 characters.'),
    clinicAddress: z
      .string()
      .trim()
      .min(5, 'Clinic address must be at least 5 characters.')
      .max(250, 'Clinic address cannot exceed 250 characters.'),
    consultationFee: z
      .string()
      .trim()
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        'Consultation fee must be a valid positive number.'
      ),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Please enter your password.'),
});

export type PatientRegisterInput = z.infer<typeof patientRegisterSchema>;
export type DoctorRegisterInput = z.infer<typeof doctorRegisterSchema>;
export type LoginSchemaInput = z.infer<typeof loginSchema>;
