// src/components/ShareModal.tsx
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { api } from "../lib/api"; // adjust path if needed
import { Download, Facebook, Twitter, Linkedin, MessageCircle, X } from "lucide-react";

type Agent = {
  firstName: string;
  lastName?: string;
  city?: string;
  state?: string;
  profileImageUrl?: string;
  propaddaVerified?: boolean;
};

type Metrics = {
  totalPropertiesPosted?: number;
  activeProperties?: number;
  totalPropertiesSold?: number;
  totalPropertiesPendingApproval?: number;
};

export default function ShareModal({
  open,
  onClose,
  agent,
  metrics,
}: {
  open: boolean;
  onClose: () => void;
  agent: Agent;
  metrics: Metrics;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const renderToBlob = async (): Promise<Blob> => {
    if (!modalRef.current) throw new Error("Modal not ready");
    // Using scale:1 for stable layout across devices. Increase for extra sharpness.
    const canvas = await html2canvas(modalRef.current as HTMLElement, {
      scale: 1,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: document.documentElement.clientWidth,
      windowHeight: document.documentElement.clientHeight,
    });
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/png"));
  };

  const downloadBlob = async (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeName = `${(agent.firstName ?? "agent")}_${(agent.lastName ?? "")}`.replace(/\s+/g, "_");
    a.href = url;
    a.download = `propadda-${safeName}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const uploadToBackend = async (blob: Blob) => {
    const fd = new FormData();
    fd.append("file", blob, `propadda-${agent.firstName ?? "agent"}.png`);
    const resp = await api.post("/agent/share/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return resp.data?.url as string;
  };

  const onDownloadClick = async () => {
    try {
      setBusy(true);
      const blob = await renderToBlob();
      await downloadBlob(blob);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setBusy(false);
    }
  };

  const onShareGeneric = async (platform: "facebook" | "twitter" | "linkedin" | "whatsapp" | "x") => {
    try {
      setBusy(true);
      const blob = await renderToBlob();

      // Web Share API (mobile) with file
      const nav: any = navigator;
      if (nav && nav.canShare && nav.canShare({ files: [new File([blob], "agent.png", { type: "image/png" })] })) {
        try {
          await nav.share({
            files: [new File([blob], "agent.png", { type: "image/png" })],
            title: `${agent.firstName} ${agent.lastName} — PropAdda`,
            text: `Check my PropAdda stats`,
          });
          return;
        } catch (err) {
          console.warn("Web share failed or cancelled:", err);
        }
      }

      // fallback: upload to backend (GCS) and open platform share url
      const publicUrl = await uploadToBackend(blob);

      const encoded = encodeURIComponent;
      const shareText = encoded(`Check my PropAdda stats — ${agent.firstName} ${agent.lastName}`);
      let shareUrl = "";
      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encoded(publicUrl)}`;
          break;
        case "twitter":
        case "x":
          shareUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encoded(publicUrl)}`;
          break;
        case "linkedin":
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encoded(publicUrl)}`;
          break;
        case "whatsapp":
          shareUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encoded(publicUrl)}`;
          break;
      }
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Share failed:", err);
      alert("Share failed. Check console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* modal */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">Share Agent Card</div>
              <div className="text-xs text-gray-500">Preview & share</div>
            </div>
            <div>
              <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* content (snapshot target) */}
          <div className="p-4 sm:p-6" ref={modalRef}>
            {/* The preview card: responsive layout */}
            <div className="bg-white rounded-lg border border-gray-100 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* image: on small screens center above text; on larger screens left */}
                <div className="flex-shrink-0 w-full sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {agent.profileImageUrl ? (
                    <img src={agent.profileImageUrl} alt="agent" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl sm:text-4xl text-orange-500 font-bold">
                      {(agent.firstName?.[0] ?? "A") + (agent.lastName?.[0] ?? "")}
                    </div>
                  )}
                </div>

                {/* details */}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                        {agent.firstName} {agent.lastName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {agent.city}{agent.city && agent.state ? ", " : ""}{agent.state}
                      </div>
                    </div>

                    <div className="mt-2 sm:mt-0">
                      {agent.propaddaVerified && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                          PropAdda Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* stats: responsive grid */}
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-3">
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
                      <div className="text-xs text-gray-400">Posted</div>
                      <div className="text-lg md:text-xl font-semibold">{metrics.totalPropertiesPosted ?? 0}</div>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
                      <div className="text-xs text-gray-400">Active</div>
                      <div className="text-lg md:text-xl font-semibold">{metrics.activeProperties ?? 0}</div>
                    </div>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-center">
                      <div className="text-xs text-gray-400">Sold</div>
                      <div className="text-lg md:text-xl font-semibold">{metrics.totalPropertiesSold ?? 0}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">This image can be shared on social platforms.</div>
                </div>
              </div>
            </div>
          </div>

          {/* footer actions - responsive */}
          <div className="px-4 py-3 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onDownloadClick}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded text-sm"
                >
                  <Download className="w-4 h-4" />
                  {busy ? "Processing..." : "Download"}
                </button>

                <button
                  onClick={() => onShareGeneric("whatsapp")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>

                <button
                  onClick={() => onShareGeneric("facebook")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded text-sm"
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </button>

                <button
                  onClick={() => onShareGeneric("twitter")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-sky-500 text-white rounded text-sm"
                >
                  <Twitter className="w-4 h-4" /> Twitter/X
                </button>

                <button
                  onClick={() => onShareGeneric("linkedin")}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-slate-700 text-white rounded text-sm"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </button>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
