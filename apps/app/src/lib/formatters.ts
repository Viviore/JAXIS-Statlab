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

/**
 * Standardized Philippine Peso Currency Formatter.
 * Formats a numeric value as '₱XX,XXX.XX' with consistent localized digits.
 */
export function formatPeso(
  amount: number | string | null | undefined,
  options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
): string {
  const num = typeof amount === "number" ? amount : Number(amount || 0);
  if (isNaN(num)) return "₱0.00";

  return `₱${num.toLocaleString("en-PH", {
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  })}`;
}

/**
 * Compact Peso formatter (e.g. ₱35K or ₱1.2M) for tight telemetry badges.
 */
export function formatPesoCompact(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : Number(amount || 0);
  if (isNaN(num)) return "₱0";

  if (num >= 1_000_000) {
    return `₱${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `₱${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return `₱${num.toLocaleString("en-PH")}`;
}

/**
 * Converts a numeric Philippine Peso amount into formal legal English words.
 * E.g., 23734.72 -> 'Twenty-Three Thousand Seven Hundred Thirty-Four Pesos and 72/100'
 */
export function numberToWordsPesos(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Zero Pesos Only";

  const units = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertHundreds(n: number): string {
    let str = "";
    if (n >= 100) {
      str += units[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + units[n % 10] : "") + " ";
    } else if (n > 0) {
      str += units[n] + " ";
    }
    return str.trim();
  }

  const integerPart = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - integerPart) * 100);

  let result = "";
  if (integerPart >= 1_000_000) {
    result += convertHundreds(Math.floor(integerPart / 1_000_000)) + " Million ";
  }
  const thousands = Math.floor((integerPart % 1_000_000) / 1000);
  if (thousands > 0) {
    result += convertHundreds(thousands) + " Thousand ";
  }
  const remainder = integerPart % 1000;
  if (remainder > 0) {
    result += convertHundreds(remainder) + " ";
  }

  result = result.trim();
  if (!result) result = "Zero";

  const centsText = cents > 0 ? ` and ${cents.toString().padStart(2, "0")}/100` : " Exactly";
  return `${result} Pesos${centsText}`;
}

/**
 * Normalizes user-entered names (including ALL-CAPS or all-lowercase registrations)
 * into proper Title Case while preserving special acronyms (CEO, QA) and suffixes (Jr., III, etc.).
 *
 * Examples:
 * - "BARTH BRAYAN" -> "Barth Brayan"
 * - "BARTH BRAYAN SERCENA" -> "Barth Brayan Sercena"
 * - "DR. JUAN REYES JR." -> "Dr. Juan Reyes Jr."
 */
export function normalizePersonName(rawName: string): string {
  if (!rawName || !rawName.trim()) return "";

  // Sanitize legacy "Super Admin" to "Operations Manager"
  const sanitized = rawName.trim().replace(/super\s*admin/gi, "Operations Manager");

  const ACRONYMS = new Set(["CEO", "CTO", "CFO", "COO", "HR", "QA", "SOW", "QC", "IT", "SLA"]);
  const SUFFIXES = new Set(["JR", "JR.", "SR", "SR.", "II", "III", "IV", "V"]);
  const PARTICLES = new Set(["de", "del", "la", "da", "di", "von", "van"]);

  return sanitized
    .split(/\s+/)
    .map((word, index) => {
      const upper = word.toUpperCase().replace(/[.,]/g, "");
      if (ACRONYMS.has(upper)) return word.toUpperCase();
      if (SUFFIXES.has(upper)) {
        return word.endsWith(".") ? word.toUpperCase() : word.toUpperCase() + (upper.startsWith("JR") || upper.startsWith("SR") ? "." : "");
      }
      if (index > 0 && PARTICLES.has(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

/**
 * Formats a full name or title into a realistic, compact executive signature
 * (First Initial(s) + Last Name), stripping honorifics (Dr., Prof., etc.) and
 * normalizing ALL-CAPS text into proper casing.
 *
 * Supports double first names cleanly:
 * - "BARTH BRAYAN" -> "B. Brayan"
 * - "BARTH BRAYAN SERCENA" -> "B. B. Sercena"
 * - "Mary Jane Watson" -> "M. J. Watson"
 * - "Dr. Juan Reyes Jr." -> "J. Reyes Jr."
 * - "CEO OWNER" -> "C. Owner"
 * - "OPERATIONS MANAGER" -> "O. Manager"
 */
export function formatSignatureName(rawName: string): string {
  if (!rawName || !rawName.trim()) return "Signature";

  // 1. Strip honorific titles (Dr., Prof., Atty., Engr., etc.)
  const cleaned = rawName
    .replace(/^(Dr\.|Prof\.|Atty\.|Engr\.|Mr\.|Ms\.|Mrs\.)\s+/i, "")
    .trim();

  // 2. Normalize casing so "BARTH BRAYAN" becomes "Barth Brayan"
  const normalized = normalizePersonName(cleaned);
  const parts = normalized.split(/\s+/).filter(Boolean);

  if (parts.length === 0) return rawName;
  if (parts.length === 1) return parts[0]!;

  // 3. Detect and extract suffixes (Jr., Sr., III, etc.)
  const SUFFIX_REGEX = /^(Jr\.?|Sr\.?|II|III|IV|V)$/i;
  let suffix = "";
  if (parts.length > 2 && SUFFIX_REGEX.test(parts[parts.length - 1]!)) {
    suffix = parts.pop()!;
  }

  // 4. Extract surname (last element)
  const lastName = parts.pop()!;

  // 5. Build initials from all preceding names (handles single and double first names)
  // e.g. ["Barth", "Brayan"] -> "B. B."
  // e.g. ["Barth"] -> "B."
  const initials = parts
    .map((p) => `${p.charAt(0).toUpperCase()}.`)
    .join(" ");

  const baseSignature = `${initials} ${lastName}`;
  return suffix ? `${baseSignature} ${suffix}` : baseSignature;
}



