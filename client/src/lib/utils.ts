import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a phone number to a standardized format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format the phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not 10 digits
  return phoneNumber;
}

/**
 * Truncates text to a specified length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Currency conversion and formatting utilities for Indian market
 */
const USD_TO_INR_RATE = 83; // Approximate conversion rate

export function convertUsdToInr(usdPrice: number): number {
  return Math.round(usdPrice * USD_TO_INR_RATE);
}

export function formatINR(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatINRFromUSD(usdPrice: number): string {
  const inrPrice = convertUsdToInr(usdPrice);
  return formatINR(inrPrice);
}
