import { useEffect, useState } from "react";
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react";

export default function ImageInput({ value, onChange, label = "Image" }) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUrl("");
  }, [value]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      alert("Image too large. Max 2MB.");
      return;
    }
    setBusy(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        onChange(reader.result);
        setBusy(false);
      };
      reader.onerror = () => setBusy(false);
      reader.readAsDataURL(f);
    } catch {
      setBusy(false);
    }
  };

  const applyUrl = () => {
    if (!url) return;
    onChange(url);
    setUrl("");
  };

  return (
    <div className="space-y-2">
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6b3e1f]">{label}</span>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="preview" className="h-32 w-48 object-cover rounded-xl border border-[#6b3e1f]/15" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow"
            aria-label="Remove"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#6b3e1f]/25 hover:border-[#0f4d2e] cursor-pointer text-sm text-[#6b3e1f] hover:bg-[#fdfbf7]">
            {busy ? "Uploading..." : (<><Upload size={16} /> Upload (≤2MB)</>)}
            <input type="file" accept="image/*" className="hidden" onChange={onFile} disabled={busy} />
          </label>
          <div className="flex items-stretch gap-2 flex-1">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="…or paste image URL"
              className="flex-1 rounded-xl border border-[#6b3e1f]/20 px-3 py-3 text-sm bg-white focus:outline-none focus:border-[#0f4d2e]"
            />
            <button type="button" onClick={applyUrl} className="px-4 rounded-xl bg-[#0f4d2e] text-white text-sm font-semibold hover:bg-[#0a331e]">
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FormShell({ title, onClose, children, onSubmit, submitting }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl my-8"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#6b3e1f]/10">
          <h2 className="font-display text-xl font-semibold text-[#0a331e]">{title}</h2>
          <button type="button" onClick={onClose} className="text-[#6b3e1f] hover:text-[#0a331e]">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">{children}</div>
        <div className="px-6 py-4 border-t border-[#6b3e1f]/10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#0a331e] hover:bg-[#fdfbf7]">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-60 text-white">
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function Label({ children }) {
  return <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6b3e1f] mb-2">{children}</span>;
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-[#fdfbf7] focus:outline-none focus:border-[#0f4d2e] focus:bg-white ${props.className || ""}`}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-[#6b3e1f]/20 px-4 py-2.5 text-sm bg-[#fdfbf7] focus:outline-none focus:border-[#0f4d2e] focus:bg-white ${props.className || ""}`}
    />
  );
}

export function EmptyState({ icon: Icon = ImageIcon, title, action }) {
  return (
    <div className="rounded-2xl bg-white border border-dashed border-[#6b3e1f]/20 p-12 text-center">
      <Icon size={36} className="text-[#6b3e1f]/40 mx-auto mb-4" />
      <p className="text-[#6b3e1f] mb-5">{title}</p>
      {action}
    </div>
  );
}
