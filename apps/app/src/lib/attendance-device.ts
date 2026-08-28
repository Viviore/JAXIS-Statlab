/**
 * Device & Telemetry Intelligence Parser for Staff Attendance Governance.
 * Detects Workstation vs Mobile devices, operating system, browser engine,
 * and formats human-friendly audit badges.
 */

export interface ParsedDeviceInfo {
  deviceType: "DESKTOP" | "LAPTOP" | "MOBILE" | "TABLET" | "UNKNOWN";
  deviceLabel: string;
  os: string;
  browser: string;
  isMobile: boolean;
}

export function parseUserAgent(uaString: string | null | undefined): ParsedDeviceInfo {
  if (!uaString || uaString === "Web Dashboard") {
    return {
      deviceType: "DESKTOP",
      deviceLabel: "Workstation (Desktop)",
      os: "Windows / Desktop OS",
      browser: "Chrome / WebKit",
      isMobile: false,
    };
  }

  const ua = uaString.toLowerCase();

  // 1. Detect Mobile / Tablet vs Desktop
  const isTablet = /ipad|tablet|(android(?!.*mobile))/i.test(ua);
  const isPhone = /iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua);
  const isMobile = isTablet || isPhone;

  let deviceType: ParsedDeviceInfo["deviceType"] = "DESKTOP";
  if (isTablet) deviceType = "TABLET";
  else if (isPhone) deviceType = "MOBILE";

  // 2. Detect Operating System
  let os = "Desktop OS";
  if (/windows nt 10\.0/i.test(ua)) os = "Windows 11/10";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  // 3. Detect Browser Engine
  let browser = "Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";

  // 4. Combined Label
  const prefix = isMobile ? (deviceType === "TABLET" ? "Tablet" : "Mobile") : "Workstation";
  const deviceLabel = `${prefix} — ${os} (${browser})`;

  return {
    deviceType,
    deviceLabel,
    os,
    browser,
    isMobile,
  };
}
