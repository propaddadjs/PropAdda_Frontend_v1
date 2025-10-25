// Author-Hemant Arora
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { api } from "../lib/api";
import { Download, X } from "lucide-react";
import xIcon from "../images/xIcon.png";
import facebookIcon from "../images/facebookIcon.png";
import linkedinIcon from "../images/linkedinIcon.png";
import whatsappIcon from "../images/whatsappIcon.png";

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
  logoUrl,
}: {
  open: boolean;
  onClose: () => void;
  agent: Agent;
  metrics: Metrics;
  logoUrl?: string;
}) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  // const ensureImagesAreRenderable = async (): Promise<{
  //   createdObjectUrls: string[];
  //   restoreMap: Array<{ img: HTMLImageElement; originalSrc: string | null }>;
  // }> => {
  //   const createdObjectUrls: string[] = [];
  //   const restoreMap: Array<{ img: HTMLImageElement; originalSrc: string | null }> = [];
  //   if (!modalRef.current) return { createdObjectUrls, restoreMap };

  //   const imgs = Array.from(modalRef.current.querySelectorAll<HTMLImageElement>("img"));

  //   await Promise.all(
  //     imgs.map(async (img) => {
  //       // skip images that already use blob: or data: (they're fine)
  //       if (!img.src || img.src.startsWith("blob:") || img.src.startsWith("data:")) {
  //         restoreMap.push({ img, originalSrc: img.src ?? null });
  //         return;
  //       }

  //       // Save original src for restore later
  //       const originalSrc = img.src;
  //       restoreMap.push({ img, originalSrc });

  //       try {
  //         // Attempt to fetch the image so we can create an object URL (avoids taint)
  //         // Set crossOrigin to anonymous to encourage CORS-friendly responses
  //         try { img.crossOrigin = "anonymous"; } catch {}

  //         const resp = await fetch(originalSrc, { mode: "cors" });
  //         if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  //         const blob = await resp.blob();
  //         const objectUrl = URL.createObjectURL(blob);
  //         createdObjectUrls.push(objectUrl);

  //         // Replace src with object URL and wait for it to load (or error) before returning
  //         await new Promise<void>((resolve) => {
  //           const onDone = () => {
  //             img.removeEventListener("load", onDone);
  //             img.removeEventListener("error", onDone);
  //             resolve();
  //           };
  //           img.addEventListener("load", onDone);
  //           img.addEventListener("error", onDone);
  //           img.src = objectUrl;
  //         });
  //       } catch (err) {
  //         // If fetch fails (likely CORS), we leave the original src intact.
  //         // console.warn("Could not fetch image for html2canvas:", originalSrc, err);
  //       }
  //     })
  //   );

  //   return { createdObjectUrls, restoreMap };
  // };

  // const renderToBlob = async (): Promise<Blob> => {
  //   if (!modalRef.current) throw new Error("Modal not ready");

  //   // Prepare images and get information to restore later
  //   const { createdObjectUrls, restoreMap } = await ensureImagesAreRenderable();

  //   try {
  //     const canvas = await html2canvas(modalRef.current as HTMLElement, {
  //       scale: 1,
  //       useCORS: true,
  //       backgroundColor: "#ffffff",
  //       logging: false,
  //       windowWidth: document.documentElement.clientWidth,
  //       windowHeight: document.documentElement.clientHeight,
  //     });

  //     const blob = await new Promise<Blob | null>((resolve) =>
  //       canvas.toBlob((b) => resolve(b), "image/png")
  //     );

  //     // Restore original image srcs BEFORE revoking object URLs
  //     restoreMap.forEach(({ img, originalSrc }) => {
  //       try {
  //         if (originalSrc) {
  //           img.src = originalSrc;
  //         } else {
  //           // If original was empty, remove src attribute
  //           img.removeAttribute("src");
  //         }
  //       } catch (e) {
  //         // ignore
  //       }
  //     });

  //     // Revoke created object URLs now that images were restored
  //     createdObjectUrls.forEach((u) => URL.revokeObjectURL(u));

  //     if (!blob) throw new Error("Could not create image blob");
  //     return blob;
  //   } catch (err) {
  //     // On error, still attempt to restore and revoke
  //     restoreMap.forEach(({ img, originalSrc }) => {
  //       try {
  //         if (originalSrc) img.src = originalSrc;
  //         else img.removeAttribute("src");
  //       } catch (e) {}
  //     });
  //     createdObjectUrls.forEach((u) => URL.revokeObjectURL(u));
  //     throw err;
  //   }
  // };

  const createRenderableCloneAndObjectUrls = async (): Promise<{
    cloneEl: HTMLElement;
    createdObjectUrls: string[];
  }> => {
    if (!modalRef.current) throw new Error("Modal ref not available");

    // Deep clone the modal element (including children)
    const clone = modalRef.current.cloneNode(true) as HTMLElement;

    // Style clone so it's offscreen and doesn't affect layout
    clone.style.position = "fixed";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.opacity = "0";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "99999";

    // Append to body so html2canvas can render it
    document.body.appendChild(clone);

    const imgs = Array.from(clone.querySelectorAll<HTMLImageElement>("img"));
    const createdObjectUrls: string[] = [];

    // For each image in the clone, if it has a non-blob/data src, try to fetch it
    await Promise.all(
      imgs.map(async (img) => {
        const src = img.getAttribute("src") ?? "";
        if (!src || src.startsWith("blob:") || src.startsWith("data:")) {
          // nothing to do
          return;
        }

        // Make a best-effort fetch of the image with CORS
        try {
          // ensure we request CORS — many public images will allow this
          const resp = await fetch(encodeURI(src), { mode: "cors", cache: "force-cache" });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const blob = await resp.blob();
          const objectUrl = URL.createObjectURL(blob);
          createdObjectUrls.push(objectUrl);

          // Replace the clone's image src with object URL and wait for load
          await new Promise<void>((resolve) => {
            const onDone = () => {
              img.removeEventListener("load", onDone);
              img.removeEventListener("error", onDone);
              resolve();
            };
            img.addEventListener("load", onDone);
            img.addEventListener("error", onDone);
            // Set crossOrigin just in case (won't help if server rejects)
            try {
              img.crossOrigin = "anonymous";
            } catch (e) {}
            img.src = objectUrl;
          });
        } catch (e) {
          // If fetch fails (likely CORS), try to set crossOrigin and hope html2canvas can still use it.
          try {
            img.crossOrigin = "anonymous";
          } catch (err) {}
          // leave src as-is; html2canvas might still be able to draw it if CORS allows
        }
      })
    );

    return { cloneEl: clone, createdObjectUrls };
  };

  const renderCloneToBlob = async (): Promise<Blob> => {
    if (!modalRef.current) throw new Error("Modal not ready");

    const { cloneEl, createdObjectUrls } = await createRenderableCloneAndObjectUrls();

    try {
      const canvas = await html2canvas(cloneEl as HTMLElement, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      // cleanup
      try {
        document.body.removeChild(cloneEl);
      } catch (e) {}

      createdObjectUrls.forEach((u) => URL.revokeObjectURL(u));

      if (!blob) throw new Error("Could not create image blob");
      return blob;
    } catch (err) {
      // cleanup even on error
      try {
        document.body.removeChild(cloneEl);
      } catch (e) {}
      createdObjectUrls.forEach((u) => URL.revokeObjectURL(u));
      throw err;
    }
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
      // const blob = await renderToBlob();
      const blob = await renderCloneToBlob();
      await downloadBlob(blob);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image. See console for details.");
    } finally {
      setBusy(false);
    }
  };

  const onShareGeneric = async (platform: "facebook" | "twitter" | "linkedin" | "whatsapp" | "x") => {
    try {
      setBusy(true);
      // const blob = await renderToBlob();
      const blob = await renderCloneToBlob();

      const nav: any = navigator;
      if (nav?.canShare && nav.canShare({ files: [new File([blob], "agent.png", { type: "image/png" })] })) {
        try {
          await nav.share({
            files: [new File([blob], "agent.png", { type: "image/png" })],
            title: `${agent.firstName} ${agent.lastName} — PropAdda`,
            text: `Check out my PropAdda stats.`,
          });
          return;
        } catch (err) {
          console.warn("Web Share cancelled:", err);
        }
      }

      const publicUrl = await uploadToBackend(blob);
      const encoded = encodeURIComponent;
      const text = encoded(`Check my PropAdda stats — ${agent.firstName} ${agent.lastName}`);
      const urls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded(publicUrl)}`,
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encoded(publicUrl)}`,
        x: `https://twitter.com/intent/tweet?text=${text}&url=${encoded(publicUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded(publicUrl)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${text}%20${encoded(publicUrl)}`,
      };
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Share failed:", err);
      alert("Share failed. See console for details.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-h-[80vh] sm:max-h-[85vh]">
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="text-sm font-semibold">Share Agent Card</div>
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* content (snapshot target) */}
          <div className="p-4 sm:p-6 overflow-auto" ref={modalRef} style={{ maxHeight: "calc(80vh - 120px)" }}>
            <div className="relative bg-white rounded-lg border border-gray-100 p-4 sm:p-6">
              {/* Logo (fixed aspect ratio, not stretched) */}
              {logoUrl && (
                <div className="absolute right-3 top-3">
                  <img
                    src={logoUrl}
                    alt="PropAdda"
                    className="h-8 sm:h-9 w-auto object-contain max-w-[120px]"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Agent photo */}
                <div className="flex-shrink-0 w-full sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-md overflow-hidden bg-white flex items-center justify-center">
                  {agent.profileImageUrl ? (
                    <img src={agent.profileImageUrl} alt="agent" className="w-36 h-36 md:w-36 md:h-36 lg:w-full lg:h-full object-contain" />
                  ) : (
                    <div className="text-3xl sm:text-4xl text-orange-500 font-bold">
                      {(agent.firstName?.[0] ?? "A") + (agent.lastName?.[0] ?? "")}
                    </div>
                  )}
                </div>

                {/* Agent details */}
                <div className="flex-1 w-full">
                  <div>
                    <div className="text-lg sm:text-2xl font-bold text-gray-900 leading-tight">
                      {agent.firstName} {agent.lastName}
                    </div>
                    {agent.propaddaVerified && (
                      <div className="flex items-center font-bold text-green-600 text-sm mt-1">
                        {/* <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" /> */}
                        PropAdda Verified
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      {agent.city}{agent.city && agent.state ? ", " : ""}{agent.state}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="bg-orange-50 border border-orange-500 px-3 py-2 rounded-lg text-center">
                      <div className="text-xs text-black">Posted Properties</div>
                      <div className="text-lg md:text-xl font-semibold text-orange-600">
                        {metrics.totalPropertiesPosted ?? 0}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-500 px-3 py-2 rounded-lg text-center">
                      <div className="text-xs text-black">Active Listings</div>
                      <div className="text-lg md:text-xl font-semibold text-orange-600">
                        {metrics.activeProperties ?? 0}
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-500 px-3 py-2 rounded-lg text-center">
                      <div className="text-xs text-black">Sold Properties</div>
                      <div className="text-lg md:text-xl font-semibold text-orange-600">
                        {metrics.totalPropertiesSold ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* footer actions */}
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={onDownloadClick}
                  disabled={busy}
                  className="inline-flex items-center justify-center p-2 bg-white border rounded text-orange-500 hover:bg-orange-50"
                  aria-label="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                {[
                  { src: whatsappIcon, key: "whatsapp", label: "Share on WhatsApp" },
                  { src: facebookIcon, key: "facebook", label: "Share on Facebook" },
                  { src: xIcon, key: "twitter", label: "Share on X" },
                  { src: linkedinIcon, key: "linkedin", label: "Share on LinkedIn" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => onShareGeneric(item.key as any)}
                    disabled={busy}
                    aria-label={item.label}
                    className={`inline-flex items-center justify-center p-2 rounded ${busy ? "opacity-60 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"} `}
                  >
                    <img src={item.src} alt={item.label} className="w-5 h-5 object-contain" />
                  </button>
                ))}
              </div>

              <button
                onClick={onClose}
                className="px-3 py-1 bg-red-500 rounded text-sm text-white hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
