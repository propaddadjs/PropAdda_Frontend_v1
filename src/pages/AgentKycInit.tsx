import React, { useState, type DragEvent, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

// Header + Footer you already have
import Header from "../components/Header";
import Footer from "../components/Footer";

// Lucide icons (purely visual)
import {
  IdCard,
  Image as ImageIcon,
  UploadCloud,
  ShieldCheck,
  FileText,
  Loader2,
} from "lucide-react";
import PropertyAction from "../components/PropertyAction";

export default function AgentKycInit() {
  const nav = useNavigate();

  const [address, setAddress] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [aadhar, setAadhar] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const canSubmit = !!address && !!aadhar;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setMsg("We are saving your details...");
    try {
      const fd = new FormData();
      fd.append("address", address);
      if (reraNumber) fd.append("reraNumber", reraNumber);
      if (profileImage) fd.append("profileImage", profileImage);
      if (aadhar) fd.append("aadhar", aadhar);

      await api.post("/user/initiateKyc", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMsg("Your KYC has been initiated and is pending for approval with the admin.");
      // Keep busy true to show the message overlay until navigation
      setTimeout(() => nav("/account/checkKycStatus"), 2000);
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "Failed to submit KYC");
      setBusy(false); // Allow user to see error and try again
    }
  }

  const onDrop =
    (setter: (f: File | null) => void, accept: string[]) =>
    (evt: DragEvent<HTMLLabelElement>) => {
      evt.preventDefault();
      const file = evt.dataTransfer?.files?.[0];
      if (!file) return;
      const ok =
        accept.length === 0 ||
        accept.some((a) => {
          const lower = a.toLowerCase();
          return file.type.toLowerCase().includes(lower.replace(".", "")) ||
                 file.name.toLowerCase().endsWith(lower);
        });
      if (ok) setter(file);
    };

  const prevent = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header title="INITIATE KYC" />

      {/* Page intro band - NOW RESPONSIVE */}
      <section className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:text-left sm:items-start">
            <ShieldCheck className="h-10 w-10 sm:h-8 sm:w-8 flex-shrink-0 text-orange-600" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">KYC Registration</h1>
              <p className="mt-2 text-sm text-gray-600">
                Upload your documents to get verified by PropAdda and start posting your property.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Address */}
          <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
              <FileText className="h-4 w-4 text-orange-600" />
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-lg border border-orange-200 bg-[#faf6f3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 min-h-[112px]"
              placeholder="Enter your full address (required)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">Provide your full communication address.</p>
          </div>

          {/* RERA (optional) */}
          <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
              <IdCard className="h-4 w-4 text-orange-600" />
              RERA Number <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </label>
            <input
              className="w-full rounded-lg border border-orange-200 bg-[#faf6f3] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
              placeholder="Enter your RERA number (if available)"
              value={reraNumber}
              onChange={(e) => setReraNumber(e.target.value)}
            />
          </div>

          {/* Uploads grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image (optional) */}
            <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                <ImageIcon className="h-4 w-4 text-orange-600" />
                Profile Image <span className="text-gray-400 text-xs font-normal">(optional)</span>
              </label>
              <label
                onDragOver={prevent}
                onDragEnter={prevent}
                onDrop={onDrop(setProfileImage, [".png", ".jpg", ".jpeg", "image/"])}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-200 bg-[#fffaf7] px-4 py-8 text-center hover:border-orange-300 transition"
              >
                <UploadCloud className="h-7 w-7 text-orange-600" />
                <div className="text-sm text-gray-700">
                  Drag & drop or <span className="text-orange-600 font-semibold">browse</span>
                </div>
                <div className="text-xs text-gray-500">PNG, JPG, JPEG • Max 10 MB</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileImage(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
              {profileImage && (
                <div className="mt-3 text-xs text-gray-600">
                  Selected: <span className="font-medium">{profileImage.name}</span>
                </div>
              )}
            </div>

            {/* Aadhar (required) */}
            <div className="rounded-xl bg-white border border-orange-100 shadow-sm p-5">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-3">
                <IdCard className="h-4 w-4 text-orange-600" />
                Aadhar <span className="text-red-500">*</span>
              </label>
              <label
                onDragOver={prevent}
                onDragEnter={prevent}
                onDrop={onDrop(setAadhar, [".png", ".jpg", ".jpeg", ".heic", ".heif", ".pdf", ".doc", ".docx", "image/", "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"])}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-orange-200 bg-[#fffaf7] px-4 py-8 text-center hover:border-orange-300 transition"
              >
                <UploadCloud className="h-7 w-7 text-orange-600" />
                <div className="text-sm text-gray-700">
                  Drag & drop your Aadhar or <span className="text-orange-600 font-semibold">browse</span>
                </div>
                <div className="text-xs text-gray-500">
                  Formats: png, jpg, pdf, doc, etc.
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setAadhar(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
              </label>
              {aadhar && (
                <div className="mt-3 text-xs text-gray-600">
                  Selected: <span className="font-medium">{aadhar.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-white font-semibold transition hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-300"
              disabled={!canSubmit || busy}
            >
              Submit for KYC
            </button>
            <p className="mt-2 text-xs text-gray-500 text-center">
              By submitting, you agree to the verification of your documents by PropAdda.
            </p>
          </div>
        </form>
      </main>

      {/* Busy overlay */}
      {busy && (
        <div className="fixed inset-0 z-[9999] bg-black/50 grid place-items-center">
          <div className="bg-white rounded-xl max-w-md w-[90%] p-5 shadow-lg text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-orange-600 animate-spin" />
            </div>
            <p className="text-sm text-gray-700">{msg}</p>
          </div>
        </div>
      )}

      <PropertyAction />
      <Footer />
    </div>
  );
}