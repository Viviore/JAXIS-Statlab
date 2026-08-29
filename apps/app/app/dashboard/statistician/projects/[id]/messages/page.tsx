"use client";

import React, { use } from "react";
import Link from "next/link";
import { PageHeader, Button } from "@repo/ui";
import { MessageThread } from "@/features/messaging/components/MessageThread";
import { IconArrowLeft } from "@tabler/icons-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function StatisticianProjectMessagesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 gap-3 w-full animate-content-fade font-sans overflow-hidden">
      {/* Standardized PageHeader */}
      <div className="flex-shrink-0">
        <PageHeader
          breadcrumbs={[
            { label: "WORKSPACE", href: "/dashboard" },
            { label: "WORKBENCH", href: "/dashboard/statistician" },
            { label: "STUDY THREAD" },
          ]}
          title="Client Consultation Thread"
          description="Direct communication with the lead researcher and QA review desk under JAXIS firewall oversight."
          actions={
            <Link href="/dashboard/statistician">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer text-xs font-semibold rounded-[2px]"
              >
                <IconArrowLeft size={16} stroke={2} className="mr-1.5" />
                <span>Back to Workbench</span>
              </Button>
            </Link>
          }
        />
      </div>

      {/* Message Thread Component — FULL AVAILABLE HEIGHT */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageThread projectId={projectId} className="h-full min-h-0" />
      </div>
    </div>
  );
}
