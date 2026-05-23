import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { apiClient, formatApiError } from "../lib/api";
import { buildWhatsappFromNumber } from "../lib/siteData";

export default function Contact({ content = {} }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const PHONE = content.contact_phone || "+91 7338542117";
  const EMAIL = content.contact_email || "shadrasa.india@gmail.com";
  const ADDR = content.contact_address || "Karnataka, India";
  const WA = content.whatsapp_number || "917338542117";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post("/contact", form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" data-testid="contact-section" className="py-12 md:py-24 bg-[#fdfbf7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="divider-ornament mb-4">Get In Touch</p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-[#0a331e] tracking-tight">
            Connect with <span className="italic text-[#d4a017]">Shadrasa</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 space-y-4"
          >
            <InfoCard icon={Phone} title="Call Us" value={PHONE} href={`tel:${PHONE.replace(/\s/g, "")}`} testid="info-phone" />
            <InfoCard icon={Mail} title="Email Us" value={EMAIL} href={`mailto:${EMAIL}`} testid="info-email" />
            <InfoCard icon={MapPin} title="Visit Us" value={ADDR} testid="info-address" />
            <InfoCard
              icon={MessageCircle}
              title="WhatsApp"
              value="Chat with us"
              href={buildWhatsappFromNumber(WA, "Hi Shadrasa, I'd like to know more about your products.")}
              external
              testid="info-whatsapp"
              accent
            />
            <div className="rounded-2xl overflow-hidden border border-[#6b3e1f]/15 h-56" data-testid="map-embed">
              <iframe
                title="Shadrasa location"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(ADDR)}&output=embed`}
              />
            </div>
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-3 rounded-3xl bg-white p-8 md:p-10 border border-[#6b3e1f]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            data-testid="contact-form"
          >
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-[#0a331e] mb-6">Send us a message</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Your Name" required>
                <input required data-testid="contact-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="cf-input" />
              </Field>
              <Field label="Email" required>
                <input type="email" required data-testid="contact-email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="cf-input" />
              </Field>
              <Field label="Phone">
                <input data-testid="contact-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="cf-input" />
              </Field>
              <Field label="Subject">
                <input data-testid="contact-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="cf-input" />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="Message" required>
                <textarea required rows={5} data-testid="contact-message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="cf-input" />
              </Field>
            </div>
            <button type="submit" disabled={loading} data-testid="contact-submit" className="mt-6 w-full bg-[#0f4d2e] hover:bg-[#0a331e] disabled:opacity-60 text-white rounded-full font-semibold transition-all duration-300 px-6 py-3.5 btn-glow">
              {loading ? "Sending..." : "Send Message"}
            </button>
            <style>{`.cf-input { width:100%; border-radius:12px; border:1px solid rgba(107,62,31,0.2); padding:12px 16px; font-size:14px; outline:none; transition: all .2s; background:#fdfbf7;} .cf-input:focus { border-color:#0f4d2e; box-shadow:0 0 0 3px rgba(15,77,46,0.12); background:#fff;}`}</style>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon: Icon, title, value, href, external, testid, accent }) {
  const cls = `flex items-center gap-4 rounded-2xl p-5 border transition-all duration-300 ${
    accent ? "bg-[#0f4d2e] text-white border-[#0f4d2e] hover:bg-[#0a331e]" : "bg-white text-[#0a331e] border-[#6b3e1f]/10 hover:border-[#d4a017]/40"
  }`;
  const inner = (
    <>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ? "bg-[#d4a017]" : "bg-[#fdfbf7] border border-[#0f4d2e]/10"}`}>
        <Icon size={20} className={accent ? "text-white" : "text-[#0f4d2e]"} />
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${accent ? "text-[#f5e7c2]" : "text-[#6b3e1f]"}`}>{title}</p>
        <p className={`font-semibold text-base mt-1 ${accent ? "text-white" : "text-[#0a331e]"}`}>{value}</p>
      </div>
    </>
  );
  return href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} data-testid={testid} className={cls}>{inner}</a>
  ) : (
    <div data-testid={testid} className={cls}>{inner}</div>
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
