/**
 * JAXIS — Module 09: Communication Firewall Engine
 *
 * Scans all incoming message content before database persistence.
 * If prohibited contact info, off-platform messaging channels, payment handles,
 * or external URLs are detected, the message is blocked in full.
 */

export interface FirewallDetection {
  ruleName: string;
  category: "EMAIL" | "PHONE" | "PAYMENT" | "MESSENGER" | "SOCIAL" | "URL";
  label: string;
  matchedText: string;
}

export type FirewallResult =
  | { blocked: false }
  | { blocked: true; detection: FirewallDetection };

interface ProhibitedRule {
  ruleName: string;
  category: FirewallDetection["category"];
  label: string;
  regex: RegExp;
}

export const PROHIBITED_RULES: ProhibitedRule[] = [
  {
    ruleName: "EMAIL_ADDRESS",
    category: "EMAIL",
    label: "Email Address",
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  },
  {
    ruleName: "PH_MOBILE",
    category: "PHONE",
    label: "Philippine Mobile Number",
    regex: /(?:\+?63|0)[\s.-]?9\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/g,
  },
  {
    ruleName: "E_WALLET_PAYMENT",
    category: "PAYMENT",
    label: "Direct Payment / E-Wallet",
    regex: /\b(gcash|paymaya|maya|paypal|coins\.ph|dragonpay|binance|wire transfer|direct deposit)\b/gi,
  },
  {
    ruleName: "MESSAGING_APP",
    category: "MESSENGER",
    label: "External Messaging App",
    regex: /\b(whatsapp|viber|telegram|messenger|imessage|signal|wechat|skype|kakao|line app)\b/gi,
  },
  {
    ruleName: "SOCIAL_PLATFORM",
    category: "SOCIAL",
    label: "Social Media Platform",
    regex: /\b(facebook|instagram|ig|fb|twitter|tiktok|snapchat|discord|linkedin)\b/gi,
  },
  {
    ruleName: "SOCIAL_HANDLE",
    category: "SOCIAL",
    label: "Social Media Handle",
    regex: /(?:^|\s)@[a-zA-Z0-9_]{3,30}\b/g,
  },
  {
    ruleName: "EXTERNAL_URL",
    category: "URL",
    label: "External URL / Link",
    regex: /https?:\/\/(?!(?:[a-zA-Z0-9-]+\.)*jaxis\.(?:dev|local|com|io|net))[\w\-.]+\.[a-zA-Z]{2,}(?::\d+)?(?:\/\S*)?/gi,
  },
  {
    ruleName: "WWW_URL",
    category: "URL",
    label: "External Web Address",
    regex: /\bwww\.(?!(?:[a-zA-Z0-9-]+\.)*jaxis\.(?:dev|local|com|io|net))[\w\-.]+\.[a-zA-Z]{2,}(?::\d+)?(?:\/\S*)?/gi,
  },
];

/**
 * Executes server-side firewall inspection against the given message text.
 */
export function runFirewall(content: string): FirewallResult {
  if (!content || !content.trim()) {
    return { blocked: false };
  }

  for (const rule of PROHIBITED_RULES) {
    rule.regex.lastIndex = 0; // Reset stateful regex cursor
    const match = rule.regex.exec(content);
    if (match) {
      const matchedText = match[0].trim();
      return {
        blocked: true,
        detection: {
          ruleName: rule.ruleName,
          category: rule.category,
          label: rule.label,
          matchedText,
        },
      };
    }
  }

  return { blocked: false };
}

/**
 * Returns plain-English explanation for why a specific rule was triggered.
 */
export function getFirewallWarningMessage(ruleName?: string | null): string {
  switch (ruleName) {
    case "EMAIL_ADDRESS":
      return "Sharing email addresses is prohibited to protect your privacy and project security.";
    case "PH_MOBILE":
      return "Sharing phone numbers is not permitted. All research consultations are conducted inside JAXIS.";
    case "E_WALLET_PAYMENT":
      return "Direct payments outside the JAXIS escrow system are prohibited for your protection.";
    case "MESSAGING_APP":
    case "SOCIAL_PLATFORM":
    case "SOCIAL_HANDLE":
      return "Off-platform chat and social handles are not allowed. Please keep all communication inside this study thread.";
    case "EXTERNAL_URL":
    case "WWW_URL":
      return "External links are not permitted. Please upload study files through the project document vault.";
    default:
      return "Sharing external contact details, direct payment channels, or external links is not permitted.";
  }
}
