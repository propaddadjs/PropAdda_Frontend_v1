import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

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
    setBusy(true); setMsg("We are saving your details...");

    try {
      const fd = new FormData();
      fd.append("address", address);
      if (reraNumber) fd.append("reraNumber", reraNumber);
      if (profileImage) fd.append("profileImage", profileImage);
      if (aadhar) fd.append("aadhar", aadhar);

      await api.post("/user/initiateKyc", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMsg("Your KYC has been initiated and is pending for approval with the admin.");
      setBusy(false);
      setTimeout(() => nav("/account/kycStatus"), 2000);
    } catch (e:any) {
      setMsg(e?.response?.data?.message ?? "Failed to submit KYC");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Agent KYC</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <textarea className="input min-h-24" placeholder="Address (required)" value={address} onChange={e=>setAddress(e.target.value)} />
        <input className="input" placeholder="RERA number (optional)" value={reraNumber} onChange={e=>setReraNumber(e.target.value)} />
        <div>
          <label className="block text-sm">Profile image (optional)</label>
          <input type="file" accept="image/*" onChange={e=>setProfileImage(e.target.files?.[0] ?? null)} />
        </div>
        <div>
          <label className="block text-sm">Aadhar (required)</label>
          <input type="file" accept="image/*,.pdf" onChange={e=>setAadhar(e.target.files?.[0] ?? null)} />
        </div>
        <button className="btn w-full" disabled={!canSubmit || busy}>Submit for KYC</button>
      </form>

      {busy && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center">
          <div className="bg-white p-4 rounded-xl max-w-md w-full text-center">
            <p>{msg}</p>
          </div>
        </div>
      )}
    </div>
  );
}
