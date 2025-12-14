// lib/validators.ts
import mongoose from "mongoose";

export function validateEmail(email: unknown): email is string {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: unknown): password is string {
  if (typeof password !== "string") return false;
  return password.length >= 6;
}

export function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates Egyptian phone number format
 * Accepts: +20xxxxxxxxxx, 20xxxxxxxxxx, 01xxxxxxxxx, 1xxxxxxxxx
 */
export function validatePhone(phone: unknown): phone is string {
  if (typeof phone !== "string") return false;
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, "");
  // Egyptian phone: +20 followed by 10 digits, or 01 followed by 9 digits
  return /^(\+?20|0)?1[0125]\d{8}$/.test(cleaned);
}

/**
 * Validates MongoDB ObjectId format
 */
export function validateObjectId(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validates date string in YYYY-MM-DD format
 */
export function validateDateFormat(date: unknown): date is string {
  if (typeof date !== "string") return false;
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  // Check if valid date
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Validates time string in HH:MM format (24-hour)
 */
export function validateTimeFormat(time: unknown): time is string {
  if (typeof time !== "string") return false;
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hours, minutes] = time.split(":").map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

/**
 * Checks if a date is in the future (not today or past)
 */
export function isFutureDate(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
}

/**
 * Checks if a date is today or in the future
 */
export function isTodayOrFuture(date: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate >= today;
}

/**
 * Valid medical specializations
 */
export const VALID_SPECIALIZATIONS = [
  "General Practice",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Rheumatology",
  "Urology",
  "Gynecology",
  "Obstetrics",
  "ENT",
  "Dentistry",
  "Radiology",
  "Anesthesiology",
  "Emergency Medicine",
  "Family Medicine",
  "Nephrology",
  "Hematology",
  "Allergy and Immunology",
  "Infectious Disease",
  "Physical Therapy",
  "Sports Medicine",
  "Plastic Surgery",
  "Vascular Surgery",
  "Thoracic Surgery",
  "Neurosurgery",
  "General Surgery"
] as const;

export type Specialization = typeof VALID_SPECIALIZATIONS[number];

/**
 * Validates that specializations are from the allowed list
 */
export function validateSpecializations(specs: unknown): specs is string[] {
  if (!Array.isArray(specs)) return false;
  return specs.every(
    (s) => typeof s === "string" && VALID_SPECIALIZATIONS.includes(s as Specialization)
  );
}
