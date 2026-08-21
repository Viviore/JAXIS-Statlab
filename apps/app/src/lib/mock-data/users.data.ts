import type { RoleName, UserStatus } from "@prisma/client";

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleName;
  password: string; // Dev plain password for dev validation
  status: UserStatus;
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
  },
  "stat@jaxis.dev": {
    id: "usr_dev_stat_001",
    email: "stat@jaxis.dev",
    fullName: "Dr. Juan Reyes",
    role: "STATISTICIAN",
    password: "JaxisStat2026!",
    status: "ACTIVE",
  },
  "qa@jaxis.dev": {
    id: "usr_dev_qa_001",
    email: "qa@jaxis.dev",
    fullName: "QA Lead Maria",
    role: "SENIOR_QA_LEAD",
    password: "JaxisQA2026!",
    status: "ACTIVE",
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
