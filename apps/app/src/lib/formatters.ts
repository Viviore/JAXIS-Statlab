/**
 * JAXIS StatLab — Enterprise Formatters
 * Provides phone number formatting, currency display, and textual normalizers.
 */

/**
 * Real-time formatter for Philippine & international mobile phone numbers.
 * Supports:
 * - 09XX XXX XXXX (11 digits domestic, 4-3-4 chunking)
 * - +63 9XX XXX XXXX (E.164 international)
 * - 9XX XXX XXXX (auto-prepends 0 -> 09XX XXX XXXX)
 * - General domestic numbers (4-3-4 chunking up to 11 digits: XXXX XXX XXXX)
 */
export function formatPhilippinePhoneNumber(value: string): string {
  if (!value) return "";

  const trimmed = value.trim();

  // Handle + international format (+63 or other country code)
  if (trimmed.startsWith("+")) {
    const rawDigits = trimmed.slice(1).replace(/\D/g, "");

    // Specific +63 format: +63 9XX XXX XXXX (max 10 digits after +63)
    if (rawDigits.startsWith("63")) {
      const national = rawDigits.slice(2, 12); // up to 10 digits
      if (national.length === 0) return "+63 ";
      if (national.length <= 3) return `+63 ${national}`;
      if (national.length <= 6) return `+63 ${national.slice(0, 3)} ${national.slice(3)}`;
      return `+63 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
    }

    // Generic international format: +XXX XXXX XXXX (max 15 digits)
    const intlDigits = rawDigits.slice(0, 15);
    if (intlDigits.length <= 3) return `+${intlDigits}`;
    if (intlDigits.length <= 6) return `+${intlDigits.slice(0, 3)} ${intlDigits.slice(3)}`;
    if (intlDigits.length <= 10) {
      return `+${intlDigits.slice(0, 3)} ${intlDigits.slice(3, 6)} ${intlDigits.slice(6)}`;
    }
    return `+${intlDigits.slice(0, 3)} ${intlDigits.slice(3, 6)} ${intlDigits.slice(6, 10)} ${intlDigits.slice(10)}`;
  }

  // Handle 63 without leading plus (e.g. 639171234567 -> +63 917 123 4567)
  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.startsWith("63") && digitsOnly.length > 2) {
    const national = digitsOnly.slice(2, 12);
    if (national.length <= 3) return `+63 ${national}`;
    if (national.length <= 6) return `+63 ${national.slice(0, 3)} ${national.slice(3)}`;
    return `+63 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
  }

  // Handle mobile numbers starting with 9 without 0 (e.g. 9171234567 -> 0917 123 4567)
  let normalized = digitsOnly;
  if (normalized.startsWith("9") && normalized.length <= 10) {
    normalized = "0" + normalized;
  }

  // Cap at 11 digits maximum (Standard Philippine mobile: 09XX XXX XXXX)
  const capped = normalized.slice(0, 11);

  // Apply standard 4-3-4 chunking: XXXX XXX XXXX
  if (capped.length <= 4) {
    return capped;
  }
  if (capped.length <= 7) {
    return `${capped.slice(0, 4)} ${capped.slice(4)}`;
  }
  return `${capped.slice(0, 4)} ${capped.slice(4, 7)} ${capped.slice(7)}`;
}

/**
 * Real-time formatter for GCash and Maya mobile e-wallet numbers.
 * Formats 11-digit Philippine mobile numbers as 09XX-XXX-XXXX.
 * Strictly limits raw input to 11 digits to prevent overflow like 099999999999999999.
 */
export function formatEWalletNumber(value: string): string {
  if (!value) return "";

  // Strip all non-digit characters
  const digits = value.replace(/\D/g, "");

  // Normalize if started with 639 or 9
  let normalized = digits;
  if (normalized.startsWith("639")) {
    normalized = "0" + normalized.slice(2);
  } else if (normalized.startsWith("9") && normalized.length <= 10) {
    normalized = "0" + normalized;
  }

  // Strictly cap at 11 digits
  const capped = normalized.slice(0, 11);

  if (capped.length <= 4) {
    return capped;
  }
  if (capped.length <= 7) {
    return `${capped.slice(0, 4)}-${capped.slice(4)}`;
  }
  return `${capped.slice(0, 4)}-${capped.slice(4, 7)}-${capped.slice(7)}`;
}

/**
 * Real-time formatter for Philippine commercial bank account numbers.
 * Chunks digits into 4-digit hyphenated groups (e.g. 1092-8821-4401 or 0012-3456-78).
 * Limits input to 16 digits max.
 */
export function formatBankAccountNumber(value: string): string {
  if (!value) return "";

  // Strip all non-digit characters
  const digits = value.replace(/\D/g, "").slice(0, 16);
  if (!digits) return "";

  const chunks = digits.match(/.{1,4}/g);
  return chunks ? chunks.join("-") : digits;
}

/**
 * Unified settlement account number formatter based on payout channel.
 */
export function formatSettlementAccountNumber(
  channel: "GCASH" | "MAYA" | "BANK_TRANSFER" | "CASH" | string,
  value: string
): string {
  if (!value) return "";

  if (channel === "GCASH" || channel === "MAYA") {
    return formatEWalletNumber(value);
  }

  if (channel === "BANK_TRANSFER") {
    return formatBankAccountNumber(value);
  }

  // CASH or fallback
  return value.slice(0, 60);
}
