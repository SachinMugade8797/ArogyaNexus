import { prisma } from '../../lib/db/prisma';
import { hashPassword } from '../../lib/auth/password';
import { doctorRegisterSchema } from '../../lib/validations/auth';
import type { ZodIssue } from 'zod';

export interface RegisterDoctorInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  medicalSpeciality: string;
  registrationNumber: string;
  clinicName: string;
  clinicAddress: string;
  consultationFee: string | number;
  password: string;
  confirmPassword: string;
  role?: string;
  status?: string;
}

export async function registerDoctorService(input: RegisterDoctorInput) {
  // 1. Server-side validation with Zod
  const validation = doctorRegisterSchema.safeParse({
    ...input,
    consultationFee: String(input.consultationFee),
  });

  if (!validation.success) {
    const errorMessages = validation.error.issues.map((i: ZodIssue) => i.message);
    throw new Error(errorMessages[0] || 'Invalid doctor registration data.');
  }

  const {
    fullName,
    email,
    phoneNumber,
    medicalSpeciality,
    registrationNumber,
    clinicName,
    clinicAddress,
    consultationFee,
    password,
  } = validation.data;

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRegNum = registrationNumber.trim().toUpperCase();

  // 2. Check duplicate email in users table
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error('An account with this email address already exists.');
  }

  // 3. Check duplicate registration number in doctor_profiles table
  const existingReg = await prisma.doctorProfile.findUnique({
    where: { registration_number: normalizedRegNum },
  });

  if (existingReg) {
    throw new Error('A doctor with this registration number already exists.');
  }

  // 4. Hash password
  const passwordHash = await hashPassword(password);

  // 5. Atomic database transaction: Create user (role = 'doctor') and doctor_profile (status = 'pending')
  const result = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        full_name: fullName.trim(),
        email: normalizedEmail,
        phone: phoneNumber.trim(),
        password_hash: passwordHash,
        role: 'doctor', // Server forces role = 'doctor'
      },
    });

    const newDoctorProfile = await tx.doctorProfile.create({
      data: {
        user_id: newUser.id,
        speciality: medicalSpeciality.trim(),
        registration_number: normalizedRegNum,
        clinic_name: clinicName.trim(),
        clinic_address: clinicAddress.trim(),
        consultation_fee: Number(consultationFee),
        status: 'pending', // Server forces status = 'pending'
      },
    });

    return {
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        created_at: newUser.created_at,
      },
      doctorProfile: {
        id: newDoctorProfile.id,
        speciality: newDoctorProfile.speciality,
        registration_number: newDoctorProfile.registration_number,
        clinic_name: newDoctorProfile.clinic_name,
        clinic_address: newDoctorProfile.clinic_address,
        consultation_fee: Number(newDoctorProfile.consultation_fee),
        status: newDoctorProfile.status,
      },
    };
  });

  return {
    success: true,
    message: 'Doctor account created and awaiting administrator verification.',
    user: result.user,
    doctorProfile: result.doctorProfile,
  };
}
