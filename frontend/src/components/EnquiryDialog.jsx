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
        className="bg-white max-w-lg p-0 overflow-hidden border-[#0f4d2e]/15 rounded-2xl"
      >
        <div className="bg-[#0f4d2e] text-white p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-white">
              Enquire — {product?.title || "Product"}
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-1">
              Share your details and we'll reach out within 24 hours.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Full Name" required>
            <input
              required
              data-testid="enquiry-name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full rounded-lg border border-[#6b3e1f]/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e]"
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
                className="w-full rounded-lg border border-[#6b3e1f]/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e]"
              />
            </Field>
            <Field label="Phone" required>
              <input
                required
                data-testid="enquiry-phone"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-lg border border-[#6b3e1f]/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e]"
              />
            </Field>
          </div>
          <Field label="Quantity (optional)">
            <input
              data-testid="enquiry-quantity"
              placeholder="e.g. 2 jars / 5 kg"
              value={form.quantity}
              onChange={(e) => update("quantity", e.target.value)}
              className="w-full rounded-lg border border-[#6b3e1f]/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e]"
            />
          </Field>
          <Field label="Message">
            <textarea
              rows={3}
              data-testid="enquiry-message"
              value={form.message}
              onChange={(e) => update("message", e.target.value)}
              className="w-full rounded-lg border border-[#6b3e1f]/20 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4d2e]/30 focus:border-[#0f4d2e]"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            data-testid="enquiry-submit"
            className="w-full bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-60 text-white rounded-full font-semibold transition-all duration-300 px-6 py-3 text-sm"
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
      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[#6b3e1f] mb-2">
        {label} {required && <span className="text-[#d4a017]">*</span>}
      </span>
      {children}
    </label>
  );
}
