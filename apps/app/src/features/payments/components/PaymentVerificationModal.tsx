"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalFooter,
  Button,
  MoneyDisplay,
  FormTextarea,
  StatusBadge,
} from "@repo/ui";
import {
  IconCheck,
  IconX,
  IconFileText,
  IconLoader2,
  IconAlertCircle,
  IconBuildingBank,
  IconDeviceMobile,
  IconUser,
} from "@tabler/icons-react";
import { verifyPayment, rejectPayment } from "../actions";
import type { PaymentItem } from "../schemas";

interface PaymentVerificationModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentItem | null;
  onSuccess: () => void;
}

export function PaymentVerificationModal({
  open,
  onClose,
  payment,
  onSuccess,
}: PaymentVerificationModalProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!payment) return null;

  const proof = payment.proofs[0];
  const isImage =
    proof?.filePath &&
    (proof.filePath.toLowerCase().endsWith(".png") ||
      proof.filePath.toLowerCase().endsWith(".jpg") ||
      proof.filePath.toLowerCase().endsWith(".jpeg") ||
      proof.filePath.toLowerCase().endsWith(".webp"));

  const handleVerify = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await verifyPayment({ paymentId: payment.id });
      if (!res.success) {
        throw new Error(res.error.message || "Failed to verify payment deposit.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim() || rejectionReason.trim().length < 5) {
      setErrorMessage("Please provide an explanatory reason for rejection (min 5 characters).");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await rejectPayment({
        paymentId: payment.id,
        rejectionReason: rejectionReason.trim(),
      });
      if (!res.success) {
        throw new Error(res.error.message || "Failed to reject payment proof.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = payment.paymentStatus !== "PROOF_SUBMITTED";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isReadOnly ? "Deposit Receipt & Audit Inspection" : "Deposit Receipt Verification Desk"}
      description={
        isReadOnly
          ? `Audit cleared deposit details and archived payment proof for Study ${payment.project?.intakeId || payment.projectId}.`
          : `Inspect cleared institutional deposit claimed for Study ${payment.project?.intakeId || payment.projectId}.`
      }
      size="2xl"
    >
      <div className="flex flex-col gap-6 w-full">
        {/* ── Transaction Dossier ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-[2px] bg-[#01142B] border border-white/10">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
              Research Study
            </span>
            <span className="font-mono text-xs text-[#FFA040] font-semibold">
              {payment.project?.intakeId || payment.projectId}
            </span>
            <span className="font-sans text-xs text-white font-medium line-clamp-1">
              {payment.project?.researchTitle || "Research Study"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
              Lead Researcher
            </span>
            <span className="font-sans text-xs text-white font-medium flex items-center gap-1.5">
              <IconUser size={14} stroke={1.5} className="text-white/60" />
              {payment.project?.client.fullName || "Client"}
            </span>
            <span className="font-sans text-xs text-white/50">
              {payment.project?.client.clientProfile?.institutionSchool ||
                payment.project?.client.email}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
              Claimed Amount & Method
            </span>
            <div className="text-lg font-sans font-bold text-emerald-400">
              <MoneyDisplay amount={payment.amountSubmitted} />
            </div>
            <span className="font-sans text-xs text-white/70 flex items-center gap-1.5">
              {payment.paymentMethod === "GCASH" ? (
                <IconDeviceMobile size={14} stroke={1.5} className="text-[#CC6600]" />
              ) : (
                <IconBuildingBank size={14} stroke={1.5} className="text-[#CC6600]" />
              )}
              {payment.paymentMethod === "GCASH" ? "GCash Corporate" : "Bank Transfer"} (
              {payment.paymentType})
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
              Official Reference No.
            </span>
            <span className="font-mono text-xs font-bold text-white bg-white/[0.04] px-2 py-1 rounded-[2px] border border-white/10 w-fit">
              {payment.referenceNumber || "N/A"}
            </span>
            <div className="mt-1">
              <StatusBadge status={payment.paymentStatus} />
            </div>
          </div>
        </div>

        {/* ── Status Notice Banner ── */}
        {(payment.paymentStatus === "VERIFIED" || payment.paymentStatus === "FULLY_PAID") && (
          <div className="p-3.5 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-400 font-sans text-xs">
            <IconCheck size={16} stroke={2.5} className="flex-shrink-0" />
            <span>
              Authorized &amp; Cleared by {payment.verifiedBy || "Finance Officer"} on{" "}
              {new Date(payment.verifiedAt || payment.updatedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              .
            </span>
          </div>
        )}

        {payment.paymentStatus === "REJECTED" && (
          <div className="p-3.5 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 font-sans text-xs">
            <IconAlertCircle size={16} stroke={2} className="flex-shrink-0" />
            <span>
              Rejection Reason: {payment.rejectionReason || "Proof does not match institutional records."}
            </span>
          </div>
        )}

        {/* ── Receipt Preview Canvas ── */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-white/60 uppercase tracking-wider flex items-center justify-between">
            <span>Uploaded Transaction Receipt</span>
            {proof && (
              <a
                href={proof.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 font-sans text-xs flex items-center gap-1"
              >
                <IconFileText size={14} stroke={1.5} />
                <span>Open in New Window</span>
              </a>
            )}
          </label>

          {proof ? (
            <div className="p-3 rounded-[2px] bg-[#010915] border border-white/10 flex flex-col items-center justify-center max-h-[380px] overflow-hidden">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={proof.filePath}
                  alt={proof.fileName}
                  className="max-h-[360px] object-contain rounded-[2px]"
                />
              ) : (
                <div className="p-8 text-center flex flex-col items-center gap-2">
                  <IconFileText size={40} stroke={1.5} className="text-white/40" />
                  <span className="font-sans text-sm font-semibold text-white">
                    {proof.fileName}
                  </span>
                  <a
                    href={proof.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2"
                  >
                    <Button variant="outline" size="sm">
                      View PDF Document
                    </Button>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-white/40 font-sans text-xs border border-white/10 rounded-[2px]">
              No receipt document attached to this payment record.
            </div>
          )}
        </div>

        {/* ── Rejection Reason Drawer ── */}
        {isRejecting && (
          <div className="flex flex-col gap-2 p-4 rounded-[2px] bg-red-500/[0.06] border border-red-500/20">
            <FormTextarea
              label="Rejection Reason"
              placeholder="e.g. Reference number does not match bank settlement records, or receipt image is unreadable."
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              helper="This explanation will be shown directly to the Lead Researcher so they can re-upload."
            />
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 font-sans text-xs">
            <IconAlertCircle size={16} stroke={2} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Modal Footer Controls ── */}
        <ModalFooter>
          {isReadOnly ? (
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isRejecting) {
                    setIsRejecting(false);
                    setRejectionReason("");
                  } else {
                    onClose();
                  }
                }}
                disabled={isSubmitting}
              >
                {isRejecting ? "Cancel Rejection" : "Close"}
              </Button>

              {!isRejecting ? (
                <div className="flex items-center gap-2.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsRejecting(true)}
                    disabled={isSubmitting}
                    className="text-red-400 hover:text-red-300"
                  >
                    <IconX size={14} stroke={2} />
                    <span>Reject Proof</span>
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleVerify}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 size={16} stroke={2.5} className="animate-spin text-white/90" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <IconCheck size={16} stroke={2.5} />
                        <span>Authorize &amp; Clear Funds →</span>
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-500 text-white gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 size={16} stroke={2.5} className="animate-spin text-white/90" />
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <IconX size={16} stroke={2} />
                      <span>Confirm Rejection</span>
                    </>
                  )}
                </Button>
              )}
            </>
          )}
        </ModalFooter>
      </div>
    </Modal>
  );
}
