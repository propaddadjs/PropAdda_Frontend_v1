// Author-Hemant Arora
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Images, Video, FileText, Upload, Trash2, CornerUpRight, BadgeQuestionMarkIcon } from "lucide-react";

export type SavedMeta = {
  mediaType: "IMAGE" | "VIDEO" | "BROCHURE";
  name: string;
  size: number;
};

// ---- Limits (tweak as needed) ----
const MAX_IMAGE_SIZE_MB = 100;
const MAX_VIDEO_SIZE_MB = 2500;
const MAX_BROCHURE_SIZE_MB = 200;
const MAX_TOTAL_SIZE_MB = 3500; // images + videos + brochures combined

// ---- Toast (no deps) ----
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const show = (text: string) => {
    setMsg(text);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(null), 2800);
  };
  const Toast = () =>
    msg ? (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded bg-black/80 text-white px-3 py-2 text-sm shadow">
        {msg}
      </div>
    ) : null;
  return { show, Toast };
}

const bytesToMB = (b: number) => +(b / (1024 * 1024)).toFixed(2);

const clearInput = (ref: React.RefObject<HTMLInputElement | null>) => {
  if (ref.current) {
    ref.current.value = "";
  }
};

type FilesPayload = {
  images: File[];
  videos: File[];
  brochures: File[];
};

type Props = {
  // same callback you already use in the parent
  onChanged: (meta: SavedMeta[], files?: FilesPayload) => void;
  // optional caps
  minImages?: number; // default 0 (nothing mandatory)
  maxImages?: number; // default 10
  maxVideos?: number; // default 4
  maxBrochures?: number; // default 4
};

const MediaUploader: React.FC<Props> = ({
  onChanged,
  minImages = 0,
  maxImages = 10,
  maxVideos = 4,
  maxBrochures = 4,
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [brochures, setBrochures] = useState<File[]>([]);

  // inputs (kept hidden; buttons trigger clicks)
  const imgInputRef = useRef<HTMLInputElement | null>(null);
  const vidInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const { show, Toast } = useToast();

  const totalSizeBytes = useMemo(() => {
    const imgSum = images.reduce((s, f) => s + f.size, 0);
    const vidSum = videos.reduce((s, f) => s + f.size, 0);
    const docSum = brochures.reduce((s, f) => s + f.size, 0);
    return imgSum + vidSum + docSum;
  }, [images, videos, brochures]);

  // Build lightweight meta for parent
  const meta = useMemo<SavedMeta[]>(() => {
    const imgMeta = images.map((f) => ({ mediaType: "IMAGE" as const, name: f.name, size: f.size }));
    const vidMeta = videos.map((f) => ({ mediaType: "VIDEO" as const, name: f.name, size: f.size }));
    const docMeta = brochures.map((f) => ({ mediaType: "BROCHURE" as const, name: f.name, size: f.size }));
    return [...imgMeta, ...vidMeta, ...docMeta];
  }, [images, videos, brochures]);

  // Notify parent on any change
  useEffect(() => {
    onChanged(meta, { images, videos, brochures });
  }, [meta, images, videos, brochures, onChanged]);

  // ---------- Handlers ----------
  const handleAddImages = (files: FileList | null) => {
    try {
      if (!files || files.length === 0) return;

      // type + per-file size filter
      const picked = Array.from(files).filter((f) => {
        const okType = f.type.startsWith("image/") || /\.heic$/i.test(f.name) || /\.heif$/i.test(f.name);
        const okSize = bytesToMB(f.size) <= MAX_IMAGE_SIZE_MB;
        if (!okType) show(`Unsupported image type: ${f.name}`);
        if (!okSize) show(`Image too large (>${MAX_IMAGE_SIZE_MB} MB): ${f.name}`);
        return okType && okSize;
      });

      if (picked.length === 0) return;

      // enforce max image count
      const remainingSlots = Math.max(0, maxImages - images.length);
      if (remainingSlots <= 0) {
        show(`You can upload up to ${maxImages} images.`);
        return;
      }

      let candidate = picked.slice(0, remainingSlots);

      // enforce total size cap
      while (candidate.length && bytesToMB(candidate.reduce((s, f) => s + f.size, totalSizeBytes)) > MAX_TOTAL_SIZE_MB) {
        candidate.pop();
      }
      if (candidate.length === 0) {
        show(`Total upload limit ${MAX_TOTAL_SIZE_MB} MB exceeded.`);
        return;
      }
      if (candidate.length < picked.length) show(`Trimmed images to respect limits.`);

      setImages((prev) => [...prev, ...candidate]);
    } finally {
      clearInput(imgInputRef);
    }
  };

  const handleAddVideos = (files: FileList | null) => {
    try {
      if (!files || files.length === 0) return;
      const picked = Array.from(files).filter((f) => {
        const okType = f.type.startsWith("video/");
        const okSize = bytesToMB(f.size) <= MAX_VIDEO_SIZE_MB;
        if (!okType) show(`Unsupported video type: ${f.name}`);
        if (!okSize) show(`Video too large (>${MAX_VIDEO_SIZE_MB} MB): ${f.name}`);
        return okType && okSize;
      });
      if (picked.length === 0) return;

      const remainingSlots = Math.max(0, maxVideos - videos.length);
      if (remainingSlots <= 0) {
        show(`You can upload up to ${maxVideos} videos.`);
        return;
      }

      let candidate = picked.slice(0, remainingSlots);

      // enforce total size cap
      while (candidate.length && bytesToMB(candidate.reduce((s, f) => s + f.size, totalSizeBytes)) > MAX_TOTAL_SIZE_MB) {
        candidate.pop();
      }
      if (candidate.length === 0) {
        show(`Total upload limit ${MAX_TOTAL_SIZE_MB} MB exceeded.`);
        return;
      }
      if (candidate.length < picked.length) show(`Trimmed videos to respect limits.`);

      setVideos((prev) => [...prev, ...candidate]);
    } finally {
      clearInput(vidInputRef);
    }
  };

  const handleAddBrochures = (files: FileList | null) => {
    try {
      if (!files || files.length === 0) return;
      const picked = Array.from(files).filter((f) => {
        const okType = f.type === "application/pdf" || /\.pdf$/i.test(f.name) || /\.docx?$/i.test(f.name);
        const okSize = bytesToMB(f.size) <= MAX_BROCHURE_SIZE_MB;
        if (!okType) show(`Unsupported brochure type: ${f.name}`);
        if (!okSize) show(`Brochure too large (>${MAX_BROCHURE_SIZE_MB} MB): ${f.name}`);
        return okType && okSize;
      });
      if (picked.length === 0) return;

      const remainingSlots = Math.max(0, maxBrochures - brochures.length);
      if (remainingSlots <= 0) {
        show(`You can upload up to ${maxBrochures} brochures.`);
        return;
      }

      let candidate = picked.slice(0, remainingSlots);

      // enforce total size cap
      while (candidate.length && bytesToMB(candidate.reduce((s, f) => s + f.size, totalSizeBytes)) > MAX_TOTAL_SIZE_MB) {
        candidate.pop();
      }
      if (candidate.length === 0) {
        show(`Total upload limit ${MAX_TOTAL_SIZE_MB} MB exceeded.`);
        return;
      }
      if (candidate.length < picked.length) show(`Trimmed brochures to respect limits.`);

      setBrochures((prev) => [...prev, ...candidate]);
    } finally {
      clearInput(docInputRef);
    }
  };

  const removeImageAt = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeVideoAt = (idx: number) => setVideos((prev) => prev.filter((_, i) => i !== idx));
  const removeBrochureAt = (idx: number) => setBrochures((prev) => prev.filter((_, i) => i !== idx));

  // Previews (object URLs) — created for images only
  const imageUrls = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  // revoke image object URLs when images change to avoid leaks
  useEffect(() => {
    return () => {
      imageUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imageUrls]);

  return (
    <div className="space-y-4">
      {/* Action buttons
          - stack on phones (flex-col)
          - horizontal row from small screens upwards
          - laptop look unchanged */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <button
          type="button"
          onClick={() => imgInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition w-full sm:w-auto justify-center"
        >
          <Images className="w-4 h-4" />
          <span className="truncate">Add Images ({images.length}/{maxImages})</span>
        </button>

        <button
          type="button"
          onClick={() => vidInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition w-full sm:w-auto justify-center"
        >
          <Video className="w-4 h-4" />
          <span className="truncate">Add Videos ({videos.length}/{maxVideos})</span>
        </button>

        <button
          type="button"
          onClick={() => docInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.99] transition w-full sm:w-auto justify-center"
        >
          <FileText className="w-4 h-4" />
          <span className="truncate">Add Brochures ({brochures.length}/{maxBrochures})</span>
        </button>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={imgInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onClick={() => clearInput(imgInputRef)}
        onChange={(e) => handleAddImages(e.target.files)}
      />
      <input
        ref={vidInputRef}
        type="file"
        multiple
        accept="video/*"
        className="hidden"
        onClick={() => clearInput(vidInputRef)}
        onChange={(e) => handleAddVideos(e.target.files)}
      />
      <input
        ref={docInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,application/pdf"
        className="hidden"
        onClick={() => clearInput(docInputRef)}
        onChange={(e) => handleAddBrochures(e.target.files)}
      />

      {/* Images grid with remove X */}
      {images.length > 0 && (
        <div>
          <div className="mb-2 text-sm text-gray-600">Images: {images.length}/{maxImages} (min {minImages} optional)</div>

          {/* Responsive grid:
              phone: 2 cols
              small tablet: 3 cols
              iPad (md): 3 cols
              laptop (lg): 4 cols  <-- preserves original laptop layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {imageUrls.map((src, idx) => (
              <div
                key={idx}
                className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white transition transform duration-200 hover:scale-[1.02]"
              >
                {/* responsive image height: smaller on phones, original on md+ */}
                <img src={src} alt={`img-${idx}`} className="w-full h-20 md:h-28 object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeImageAt(idx)}
                  className="absolute top-2 right-2 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
                >
                  <Trash2 className="w-5 h-5 text-orange-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos list */}
      {videos.length > 0 && (
        <div>
          <div className="mb-2 text-sm text-gray-600">Videos: {videos.length}/{maxVideos}</div>
          <div className="space-y-2">
            {videos.map((v, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <div className="truncate text-sm inline-flex items-center gap-2">
                  <Video className="w-4 h-4 text-orange-500" />
                  <span className="truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-[24rem]">{v.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeVideoAt(idx)}
                    className="bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
                    aria-label="Remove video"
                  >
                    <Trash2 className="w-5 h-5 text-orange-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brochures list */}
      {brochures.length > 0 && (
        <div>
          <div className="mb-2 text-sm text-gray-600">Brochures: {brochures.length}/{maxBrochures}</div>
          <div className="space-y-2">
            {brochures.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
                <div className="truncate text-sm inline-flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />
                  <span className="truncate max-w-[60vw] sm:max-w-[40vw] md:max-w-[24rem]">{b.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeBrochureAt(idx)}
                  className="ml-3 bg-white rounded-full shadow p-1 hover:bg-gray-100 transition"
                  aria-label="Remove brochure"
                >
                  <Trash2 className="w-5 h-5 text-orange-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Total size indicator */}
      <div className="text-sm text-gray-600 inline-flex items-center gap-2">
        <Upload className="w-4 h-4 text-orange-500" />
        Total selected: {bytesToMB(totalSizeBytes)} MB (limit {MAX_TOTAL_SIZE_MB} MB)
      </div>
      <br />
      <div className="text-xs text-gray-600 hover:text-orange-600 inline-flex items-center gap-2">
        <BadgeQuestionMarkIcon className="w-4 h-4 text-orange-600" />
        Don't have images and videos? We can shoot for you. Proceed with posting the property and contact us for shoot through your agent panel.
      </div>

      {/* Toast portal */}
      <Toast />
    </div>
  );
};

export default MediaUploader;
