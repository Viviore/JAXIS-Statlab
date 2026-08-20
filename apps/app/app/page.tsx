import React from "react";
import { Button, Card, StatusBadge } from "@repo/ui";

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-[#010114] text-white flex flex-col items-center justify-center p-6 select-none">
      <div className="max-w-md w-full flex flex-col items-center gap-6 text-center">
        {/* Brand mark */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#CC6600] rounded-[2px] flex items-center justify-center font-mono font-bold text-white text-base tracking-wider shadow-lg">
            JX
          </div>
          <div className="flex flex-col text-left">
            <span className="font-mono font-bold text-xl tracking-widest text-white">
              JAXIS
            </span>
            <span className="font-mono text-[0.625rem] text-white/40 tracking-widest uppercase">
              STATLAB WORKSPACE
            </span>
          </div>
        </div>

        <Card className="w-full text-left">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-mono text-white/60 uppercase tracking-wider">Foundation Module</span>
            <StatusBadge status="ACTIVE" pulse />
          </div>

          <div className="py-4 text-xs text-white/70 leading-relaxed space-y-2">
            <p>
              Welcome to the <strong className="text-white">JAXIS StatLab</strong> SaaS application workspace. Monorepo tooling, design tokens, and shared UI primitives have been initialized.
            </p>
            <p className="text-white/50 text-[0.688rem]">
              Stack: Next.js 16 App Router · Supabase PostgreSQL · Cloudflare R2 · Resend · Trigger.dev
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <a href="/dashboard" className="w-full">
              <Button variant="primary" size="md" className="w-full">
                Enter Dashboard Workspace
              </Button>
            </a>
          </div>
        </Card>

        <span className="text-[0.625rem] font-mono text-white/30 tracking-wider uppercase">
          JAXIS STATLAB · CONFIDENTIAL & PROPRIETARY
        </span>
      </div>
    </div>
  );
}
