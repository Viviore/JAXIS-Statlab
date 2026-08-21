import type { RoleName, UserStatus } from "@prisma/client";

export interface MockStaffProfile {
  bio?: string;
  specializations: string[];
  joinedAt?: string;
  updatedAt?: string;
}

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  password: string; // Dev plain password for dev validation
  status: UserStatus;
  staffProfile?: MockStaffProfile;
}

export const DEV_USERS: Record<string, MockUser> = {
  "admin@jaxis.dev": {
    id: "usr_dev_admin_001",
    email: "admin@jaxis.dev",
    fullName: "Super Admin",
    role: "ADMIN",
    password: "JaxisAdmin2026!",
    status: "ACTIVE",
  },
  "ceo@jaxis.dev": {
    id: "usr_dev_ceo_001",
    email: "ceo@jaxis.dev",
    fullName: "CEO Owner",
    role: "CEO",
    password: "JaxisCeo2026!",
    status: "ACTIVE",
  },
  "finance@jaxis.dev": {
    id: "usr_dev_finance_001",
    email: "finance@jaxis.dev",
    fullName: "Finance Officer",
    role: "FINANCE_OFFICER",
    password: "JaxisFin2026!",
    status: "ACTIVE",
    staffProfile: {
      bio: "Finance Officer overseeing institutional escrow vault release gates, dispute resolutions, and milestone disbursements.",
      specializations: ["Escrow Management", "Ledger Auditing", "Disbursement Protocol"],
      joinedAt: "2026-01-15T08:00:00.000Z",
    },
  },
  "stat@jaxis.dev": {
    id: "usr_dev_stat_001",
    email: "stat@jaxis.dev",
    fullName: "Dr. Juan Reyes",
    role: "STATISTICIAN",
    password: "JaxisStat2026!",
    status: "ACTIVE",
    staffProfile: {
      bio: "Senior PhD statistician specializing in multivariate quantitative models, structural equation modeling, and APA-compliant statistical reporting.",
      specializations: ["Regression", "ANOVA", "SEM", "Factor Analysis", "Time Series"],
      joinedAt: "2026-01-10T08:00:00.000Z",
    },
  },
  "qa@jaxis.dev": {
    id: "usr_dev_qa_001",
    email: "qa@jaxis.dev",
    fullName: "QA Lead Maria",
    role: "SENIOR_QA_LEAD",
    password: "JaxisQA2026!",
    status: "ACTIVE",
    staffProfile: {
      bio: "Senior QA Peer Review Lead ensuring data integrity, calculation verifiability, and methodological rigor across all statistical deliverables.",
      specializations: ["Instrument Validation", "Descriptive Statistics", "Mixed Methods", "Reliability Analysis"],
      joinedAt: "2026-01-12T08:00:00.000Z",
    },
  },
  "client@jaxis.dev": {
    id: "usr_dev_client_001",
    email: "client@jaxis.dev",
    fullName: "Client Ana Cruz",
    role: "CLIENT",
    password: "JaxisClient2026!",
    status: "ACTIVE",
  },
  "suspended@jaxis.dev": {
    id: "usr_dev_suspended_001",
    email: "suspended@jaxis.dev",
    fullName: "Suspended Test User",
    role: "CLIENT",
    password: "JaxisSuspended2026!",
    status: "SUSPENDED",
  },
};

const globalStore = globalThis as unknown as {
  __DEV_USERS_STORE__?: Record<string, MockUser>;
};

if (!globalStore.__DEV_USERS_STORE__) {
  globalStore.__DEV_USERS_STORE__ = { ...DEV_USERS };
}

export function getDevUsers(): Record<string, MockUser> {
  if (!globalStore.__DEV_USERS_STORE__) {
    globalStore.__DEV_USERS_STORE__ = { ...DEV_USERS };
  }
  return globalStore.__DEV_USERS_STORE__;
}

export function getDevUserByEmail(email: string): MockUser | undefined {
  const users = getDevUsers();
  return users[email.toLowerCase().trim()];
}

export function registerDevUser(user: MockUser): void {
  const users = getDevUsers();
  users[user.email.toLowerCase().trim()] = user;
}
