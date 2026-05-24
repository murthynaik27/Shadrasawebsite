import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { apiClient, formatApiError, buildWhatsappLink } from "../lib/api";

export default function EnquiryDialog({ open, onOpenChange, product }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    quantity: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!product) return;
    setLoading(true);
    try {
      await apiClient.post("/enquiry", {
        ...form,
        product: product.title,
      });
      toast.success("Enquiry sent! We'll be in touch soon.");
      // Open WhatsApp with prefilled message
      const text = `Hi Shadrasa! I'm interested in *${product.title}*.\n\nName: ${form.name}\nPhone: ${form.phone}\nQuantity: ${form.quantity || "—"}\nMessage: ${form.message || "—"}`;
      window.open(buildWhatsappLink(text), "_blank");
      setForm({ name: "", email: "", phone: "", quantity: "", message: "" });
      onOpenChange(false);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="enquiry-dialog"
        className="!bg-white !w-[92vw] sm:!w-full !max-w-[420px] !p-0 !overflow-hidden border border-[#0f4d2e]/15 !rounded-2xl [&>button]:hidden"
      >
        <div className="relative bg-[#0f5132] text-white px-[10px] py-[16px] text-center">
          <button 
            className="absolute top-[10px] right-[12px] bg-white text-black border-none rounded-full w-[28px] h-[28px] text-[16px] cursor-pointer flex items-center justify-center leading-none shadow-sm hover:bg-gray-100" 
            onClick={(e) => { e.preventDefault(); onOpenChange(false); }}
          >
            ✕
          </button>
          <DialogHeader>
            <DialogTitle className="font-display text-[16px] sm:text-[20px] text-white mt-1">
              Enquire — {product?.title || "Product"}
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1 text-[12px]">
              Share your details and we'll reach out within 24 hours.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="p-[10px] sm:p-[12px] space-y-[10px]">
          <Field label="Full Name" required>
            <input
              required
              data-testid="enquiry-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-[8px] border border-[#ccc] px-[10px] py-[8px] text-[13px] box-border focus:outline-none focus:border-[#0f5132]"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email" required>
              <input
                type="email"
                required
                data-testid="enquiry-email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-[8px] border border-[#ccc] px-[10px] py-[8px] text-[13px] box-border focus:outline-none focus:border-[#0f5132]"
              />
            </Field>
            <Field label="Phone" required>
              <input
                required
                data-testid="enquiry-phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-[8px] border border-[#ccc] px-[10px] py-[8px] text-[13px] box-border focus:outline-none focus:border-[#0f5132]"
              />
            </Field>
          </div>
          <Field label="Quantity (optional)">
            <input
              data-testid="enquiry-quantity"
              placeholder="e.g. 2 jars / 5 kg"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              className="w-full rounded-[8px] border border-[#ccc] px-[10px] py-[8px] text-[13px] box-border focus:outline-none focus:border-[#0f5132]"
            />
          </Field>
          <Field label="Message">
            <textarea
              rows={3}
              data-testid="enquiry-message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full rounded-[8px] min-h-[80px] border border-[#ccc] px-[10px] py-[8px] text-[13px] box-border focus:outline-none focus:border-[#0f5132]"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            data-testid="enquiry-submit"
            className="w-full bg-[#0f5132] hover:bg-[#0a331e] disabled:opacity-60 text-white !rounded-[20px] font-semibold transition-all duration-300 py-[10px] text-[14px] mt-1 border-none"
          >
            {loading ? "Sending..." : "Submit & Open WhatsApp"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-[1px] text-[#6b3e1f] mb-1.5">
        {label} {required && <span className="text-[#d4a017]">*</span>}
      </span>
      {children}
    </label>
  );
}
